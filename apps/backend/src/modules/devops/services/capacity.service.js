/**
 * Infrastructure Capacity — real telemetry only.
 * Missing sources return `{ available: false, reason }` — never invent numbers.
 */
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cache from '#config/cache.js';
import { getQueueHealthDetail } from '#config/queueRuntime.js';
import DevopsCapacitySnapshot from '../models/devopsCapacitySnapshot.model.js';

const CACHE_TTL_MS = Number(process.env.DEVOPS_CAPACITY_CACHE_MS) || 15_000;
const SNAPSHOT_MIN_INTERVAL_MS = Number(process.env.DEVOPS_CAPACITY_SNAPSHOT_MS) || 5 * 60_000;
const DIR_SIZE_CACHE_MS = 5 * 60_000;
const MAX_DIR_BYTES_WALK = 2_000_000_000; // soft cap walk effort
const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'coverage',
  '.turbo',
  'out',
  '.cache',
]);

/**
 * Collection → app bucket (Mongo data ownership).
 * Matches real Mongoose pluralized names + devops_* / agendaJobs.
 */
const APP_COLLECTION_RULES = [
  {
    app: 'devops',
    test: (n) => n.startsWith('devops_'),
  },
  {
    app: 'queue',
    test: (n) => n === 'agendajobs',
  },
  {
    app: 'b2b',
    test: (n) =>
      /^(agencies|agencyusers|agencystatuslogs|quoterequests|customproposals|adminusers|refreshtokens|counters|b2bpackages|b2bhotels|b2bcities|b2b)/i.test(
        n
      ),
  },
  {
    app: 'b2c',
    test: (n) =>
      /^(packages|bookings|blogs|destinations|stories|reviews|users|visitors|apihits|newsletters|websitehero|uiconfig)/i.test(
        n
      ),
  },
];

let memCache = { at: 0, payload: null };
let lastSnapshotAt = 0;
let dirSizeCache = { at: 0, payload: null };
let snapshotInFlight = null;
let collectInFlight = null;

function trafficLight(pct, yellowAt, redAt) {
  if (pct == null || Number.isNaN(pct)) return 'unknown';
  if (pct >= redAt) return 'red';
  if (pct >= yellowAt) return 'yellow';
  return 'green';
}

function pct(used, total) {
  if (total == null || total <= 0 || used == null) return null;
  return Number(((used / total) * 100).toFixed(2));
}

function bytesOrNull(n) {
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

function diskPath() {
  return process.env.DEVOPS_DISK_PATH || process.cwd();
}

async function collectDisk() {
  const target = diskPath();
  try {
    const s = await fs.statfs(target);
    const totalBytes = Number(s.bsize) * Number(s.blocks);
    const freeBytes = Number(s.bsize) * Number(s.bavail ?? s.bfree);
    const usedBytes = totalBytes - freeBytes;
    const pctUsed = pct(usedBytes, totalBytes);
    return {
      available: true,
      path: target,
      hostname: os.hostname(),
      platform: process.platform,
      scope: 'node_host',
      note: 'Disk of the machine running this Node backend process (local PC in dev; VPS/container in production). Not Mongo Atlas storage.',
      totalBytes,
      usedBytes,
      freeBytes,
      pctUsed,
      health: trafficLight(pctUsed, 80, 90),
    };
  } catch (err) {
    return {
      available: false,
      path: target,
      reason: `Disk stats unavailable: ${err.message}`,
      health: 'unknown',
    };
  }
}

async function collectOsMemory() {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = totalBytes - freeBytes;
  const usedPct = pct(usedBytes, totalBytes);
  const mem = process.memoryUsage();
  const load = os.loadavg?.() || [0, 0, 0];
  const cores = os.cpus()?.length || null;
  return {
    available: true,
    hostname: os.hostname(),
    platform: process.platform,
    scope: 'node_host',
    note: 'RAM/CPU of the machine running this Node backend (local PC in dev). Not Mongo/Redis cloud hosts.',
    os: {
      totalBytes,
      freeBytes,
      usedBytes,
      usedPct,
      health: trafficLight(usedPct, 85, 95),
    },
    node: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers,
    },
    cpu: {
      load1: load[0],
      load5: load[1],
      load15: load[2],
      cores,
      loadPerCore: cores && cores > 0 ? Number((load[0] / cores).toFixed(3)) : null,
      health: (() => {
        if (!cores) return 'unknown';
        if (process.platform === 'win32' && load[0] === 0 && load[1] === 0) {
          return 'unknown';
        }
        const ratio = load[0] / cores;
        if (ratio >= 0.9) return 'red';
        if (ratio >= 0.7) return 'yellow';
        return 'green';
      })(),
    },
    uptimeSec: Math.round(process.uptime()),
    nodeVersion: process.version,
  };
}

async function collectRedis() {
  try {
    const info = await cache.info('memory');
    const stats = await cache.info('stats');
    const parse = (block, key) => {
      const m = new RegExp(`^${key}:(.+)$`, 'm').exec(block);
      return m ? m[1].trim() : null;
    };
    const usedMemory = Number(parse(info, 'used_memory')) || null;
    const maxMemory = Number(parse(info, 'maxmemory')) || 0;
    const usedMemoryPeak = Number(parse(info, 'used_memory_peak')) || null;
    const usedMemoryRss = Number(parse(info, 'used_memory_rss')) || null;
    const totalSystemMemory = Number(parse(info, 'total_system_memory')) || null;
    const keyspaceHits = Number(parse(stats, 'keyspace_hits')) || null;
    const keyspaceMisses = Number(parse(stats, 'keyspace_misses')) || null;

    let pctUsed = null;
    let limitSource = 'none';
    if (maxMemory > 0) {
      pctUsed = pct(usedMemory, maxMemory);
      limitSource = 'maxmemory';
    } else if (totalSystemMemory > 0) {
      pctUsed = pct(usedMemory, totalSystemMemory);
      limitSource = 'total_system_memory';
    }

    return {
      available: true,
      usedMemory,
      maxMemory: maxMemory > 0 ? maxMemory : null,
      usedMemoryPeak,
      usedMemoryRss,
      totalSystemMemory,
      pctUsed,
      limitSource,
      keyspaceHits,
      keyspaceMisses,
      health: trafficLight(pctUsed ?? 0, 85, 95),
      note:
        maxMemory === 0
          ? 'Redis maxmemory is 0 (unlimited). pctUsed uses total_system_memory when available.'
          : null,
    };
  } catch (err) {
    return {
      available: false,
      reason: `Redis INFO unavailable: ${err.message}`,
      health: 'unknown',
    };
  }
}

async function collectMongoDb() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return {
      available: false,
      reason: 'MongoDB not connected',
      health: 'unknown',
      collections: [],
    };
  }

  const db = mongoose.connection.db;
  try {
    const [dbStats, serverStatus] = await Promise.all([
      db.stats(),
      db
        .admin()
        .serverStatus()
        .catch((e) => ({ _error: e.message })),
    ]);

    const list = await db.listCollections().toArray();
    const collections = [];
    for (const col of list) {
      const name = col.name;
      try {
        const st = await db.command({ collStats: name });
        collections.push({
          name,
          ns: st.ns || `${db.databaseName}.${name}`,
          count: bytesOrNull(st.count) ?? 0,
          size: bytesOrNull(st.size) ?? 0,
          storageSize: bytesOrNull(st.storageSize) ?? 0,
          totalIndexSize: bytesOrNull(st.totalIndexSize) ?? 0,
          nindexes: bytesOrNull(st.nindexes) ?? 0,
          avgObjSize: bytesOrNull(st.avgObjSize),
          capped: Boolean(st.capped),
        });
      } catch (err) {
        collections.push({
          name,
          available: false,
          reason: err.message,
        });
      }
    }

    collections.sort((a, b) => (b.storageSize || 0) - (a.storageSize || 0));

    const dataSize = bytesOrNull(dbStats.dataSize);
    const storageSize = bytesOrNull(dbStats.storageSize);
    const indexSize = bytesOrNull(dbStats.indexSize);
    const fsUsedSize = bytesOrNull(dbStats.fsUsedSize);
    const fsTotalSize = bytesOrNull(dbStats.fsTotalSize);

    let pctUsed = null;
    let limitSource = 'none';
    if (fsTotalSize && fsUsedSize != null) {
      pctUsed = pct(fsUsedSize, fsTotalSize);
      limitSource = 'fsTotalSize';
    }

    const wt = serverStatus?.wiredTiger?.cache;
    const wiredTiger = wt
      ? {
          available: true,
          bytesInCache: bytesOrNull(
            wt['bytes currently in the cache'] ?? wt.bytes_currently_in_cache
          ),
          maxBytesConfigured: bytesOrNull(
            wt['maximum bytes configured'] ?? wt.maximum_bytes_configured
          ),
          pagesEvicted: bytesOrNull(wt['pages evicted by application threads'] ?? null),
        }
      : serverStatus?._error
        ? { available: false, reason: serverStatus._error }
        : { available: false, reason: 'wiredTiger cache metrics not present' };

    const totalUsedBytes =
      (storageSize || 0) + (indexSize || 0) > 0
        ? (storageSize || 0) + (indexSize || 0)
        : storageSize;

    // Never invent a quota % — only traffic-light when fsTotalSize is known.
    // Without quota: green when we have real sizes; yellow if storage looks empty/unreadable.
    let health;
    if (pctUsed != null) {
      health = trafficLight(pctUsed, 70, 85);
    } else if (totalUsedBytes != null || dataSize != null) {
      health = 'green';
    } else {
      health = 'yellow';
    }

    return {
      available: true,
      dbName: db.databaseName,
      dataSize,
      storageSize,
      indexSize,
      totalUsedBytes,
      objects: bytesOrNull(dbStats.objects),
      collectionsCount: bytesOrNull(dbStats.collections) ?? collections.length,
      avgObjSize: bytesOrNull(dbStats.avgObjSize),
      fsUsedSize,
      fsTotalSize,
      pctUsed,
      limitSource,
      freeBytes: fsTotalSize != null && fsUsedSize != null ? fsTotalSize - fsUsedSize : null,
      note:
        limitSource === 'none'
          ? 'Mongo did not report fsTotalSize (common on Atlas free/shared). Showing real data/storage/index sizes — no invented quota %.'
          : null,
      wiredTiger,
      health,
      quotaKnown: pctUsed != null,
      collections,
      top20: collections.filter((c) => c.storageSize != null).slice(0, 20),
    };
  } catch (err) {
    return {
      available: false,
      reason: `Mongo capacity read failed: ${err.message}`,
      health: 'unknown',
      collections: [],
    };
  }
}

function classifyCollection(name) {
  const lower = String(name || '').toLowerCase();
  for (const rule of APP_COLLECTION_RULES) {
    if (rule.test(lower)) return rule.app;
  }
  return 'other';
}

function mongoAppsBreakdown(collections) {
  const buckets = {
    b2c: { storageSize: 0, dataSize: 0, count: 0, collections: 0 },
    b2b: { storageSize: 0, dataSize: 0, count: 0, collections: 0 },
    admin: { storageSize: 0, dataSize: 0, count: 0, collections: 0 },
    backend: { storageSize: 0, dataSize: 0, count: 0, collections: 0 },
    devops: { storageSize: 0, dataSize: 0, count: 0, collections: 0 },
    queue: { storageSize: 0, dataSize: 0, count: 0, collections: 0 },
    other: { storageSize: 0, dataSize: 0, count: 0, collections: 0 },
  };

  for (const c of collections) {
    if (c.storageSize == null) continue;
    const app = classifyCollection(c.name);
    const key = app === 'queue' ? 'queue' : app;
    // Admin portal shares B2C user/content models — no separate admin DB.
    // Backend operational = devops + queue.
    const bucket =
      key === 'devops' || key === 'queue' ? key : key === 'b2c' || key === 'b2b' ? key : 'other';
    buckets[bucket].storageSize += c.storageSize || 0;
    buckets[bucket].dataSize += c.size || 0;
    buckets[bucket].count += c.count || 0;
    buckets[bucket].collections += 1;
  }

  // Map to product surfaces for the UI
  return {
    available: true,
    source: 'mongodb_collStats',
    note: 'App breakdown is Mongo collection ownership by name heuristics — not separate databases. Admin UI data lives in B2C collections. Backend ops = devops_* + agendaJobs.',
    apps: {
      b2c: buckets.b2c,
      b2b: buckets.b2b,
      admin: {
        ...buckets.admin,
        note: 'No dedicated admin Mongo collections; admin consumes B2C models.',
      },
      backend: {
        storageSize: buckets.devops.storageSize + buckets.queue.storageSize,
        dataSize: buckets.devops.dataSize + buckets.queue.dataSize,
        count: buckets.devops.count + buckets.queue.count,
        collections: buckets.devops.collections + buckets.queue.collections,
        note: 'devops_* + agendaJobs',
      },
      other: buckets.other,
    },
  };
}

async function walkDirSize(root, state) {
  if (state.stopped) return;
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (state.stopped) return;
    const full = path.join(root, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      await walkDirSize(full, state);
    } else if (ent.isFile()) {
      try {
        const st = await fs.stat(full);
        state.bytes += st.size;
        state.files += 1;
        if (state.bytes > MAX_DIR_BYTES_WALK) state.stopped = true;
      } catch {
        /* skip */
      }
    }
  }
}

function repoRootGuess() {
  // capacity.service.js → .../src/modules/devops/services → up to monorepo root
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../../../../../');
}

async function collectAppDiskSizes() {
  if (dirSizeCache.payload && Date.now() - dirSizeCache.at < DIR_SIZE_CACHE_MS) {
    return dirSizeCache.payload;
  }

  const root = process.env.DEVOPS_REPO_ROOT || repoRootGuess();
  const targets = [
    { key: 'b2c', rel: 'apps/b2c-web' },
    { key: 'b2b', rel: 'apps/b2b-portal' },
    { key: 'admin', rel: 'apps/admin' },
    { key: 'backend', rel: 'apps/backend' },
  ];

  const filesystem = {};
  let anyOk = false;

  for (const t of targets) {
    const abs = path.join(root, t.rel);
    try {
      await fs.access(abs);
      const state = { bytes: 0, files: 0, stopped: false };
      await walkDirSize(abs, state);
      filesystem[t.key] = {
        available: true,
        path: abs,
        bytes: state.bytes,
        files: state.files,
        truncated: state.stopped,
        note: state.stopped
          ? 'Walk stopped at soft size cap; excludes node_modules/.next/.git'
          : 'Excludes node_modules/.next/.git',
      };
      anyOk = true;
    } catch (err) {
      filesystem[t.key] = {
        available: false,
        path: abs,
        reason: err.message,
      };
    }
  }

  const payload = {
    available: anyOk,
    repoRoot: root,
    filesystem,
    reason: anyOk ? null : 'Could not read monorepo app directories on this host',
  };
  dirSizeCache = { at: Date.now(), payload };
  return payload;
}

async function collectCloud() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      available: false,
      provider: 'cloudinary',
      reason:
        'CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET not all set — section omitted (not zeroed)',
    };
  }

  try {
    const cloudinary = (await import('#config/cloudinary.js')).default;
    const usage = await cloudinary.api.usage();
    return {
      available: true,
      provider: 'cloudinary',
      plan: usage.plan || null,
      lastUpdated: usage.last_updated || null,
      transformations: usage.transformations || null,
      objects: usage.objects || null,
      bandwidth: usage.bandwidth || null,
      storage: usage.storage || null,
      requests: usage.requests || null,
      credits: usage.credits || null,
      mediaLimits: usage.media_limits || null,
    };
  } catch (err) {
    return {
      available: false,
      provider: 'cloudinary',
      reason: `Cloudinary Admin API failed: ${err.message}`,
    };
  }
}

async function collectQueue() {
  try {
    const detail = await getQueueHealthDetail();
    const pendingNames = Object.keys(detail.jobs || {});
    let totalJobs = 0;
    let failedJobs = 0;
    for (const name of pendingNames) {
      totalJobs += detail.jobs[name]?.total || 0;
      failedJobs += detail.jobs[name]?.withFailureHistory || 0;
    }
    return {
      available: true,
      ...detail,
      totals: { totalJobs, failedJobs },
      health:
        !detail.mongoConnected || !detail.agendaWorkerStarted
          ? 'red'
          : failedJobs > 0
            ? 'yellow'
            : 'green',
    };
  } catch (err) {
    return {
      available: false,
      reason: err.message,
      health: 'unknown',
    };
  }
}

function snapshotDocFromLive(live) {
  return {
    ts: new Date(),
    disk: live.disk?.available
      ? {
          path: live.disk.path,
          totalBytes: live.disk.totalBytes,
          usedBytes: live.disk.usedBytes,
          freeBytes: live.disk.freeBytes,
          pctUsed: live.disk.pctUsed,
        }
      : undefined,
    mongo: live.mongodb?.available
      ? {
          dataSize: live.mongodb.dataSize,
          storageSize: live.mongodb.storageSize,
          indexSize: live.mongodb.indexSize,
          collections: live.mongodb.collectionsCount,
          objects: live.mongodb.objects,
          fsUsedSize: live.mongodb.fsUsedSize,
          fsTotalSize: live.mongodb.fsTotalSize,
        }
      : undefined,
    memory: live.memory?.available
      ? {
          totalBytes: live.memory.os.totalBytes,
          freeBytes: live.memory.os.freeBytes,
          usedPct: live.memory.os.usedPct,
          heapUsed: live.memory.node.heapUsed,
          rss: live.memory.node.rss,
        }
      : undefined,
    redis: live.redis?.available
      ? {
          available: true,
          usedMemory: live.redis.usedMemory,
          maxMemory: live.redis.maxMemory,
          pctUsed: live.redis.pctUsed,
        }
      : { available: false },
    cpu: live.memory?.cpu
      ? {
          load1: live.memory.cpu.load1,
          load5: live.memory.cpu.load5,
          load15: live.memory.cpu.load15,
          cores: live.memory.cpu.cores,
        }
      : undefined,
  };
}

async function maybePersistSnapshot(live) {
  const now = Date.now();
  if (now - lastSnapshotAt < SNAPSHOT_MIN_INTERVAL_MS) return;
  if (snapshotInFlight) return snapshotInFlight;

  snapshotInFlight = (async () => {
    try {
      await DevopsCapacitySnapshot.create(snapshotDocFromLive(live));
      lastSnapshotAt = Date.now();
    } catch {
      /* never fail the request path */
    } finally {
      snapshotInFlight = null;
    }
  })();

  return snapshotInFlight;
}

function growthBetween(older, newer, fieldPath) {
  if (!older || !newer) return null;
  const get = (obj, pathStr) => pathStr.split('.').reduce((a, k) => (a == null ? a : a[k]), obj);
  const a = get(older, fieldPath);
  const b = get(newer, fieldPath);
  if (a == null || b == null) return null;
  const ms = new Date(newer.ts).getTime() - new Date(older.ts).getTime();
  if (ms <= 0) return null;
  const days = ms / (24 * 60 * 60 * 1000);
  const delta = b - a;
  const perDay = delta / days;
  return {
    olderTs: older.ts,
    newerTs: newer.ts,
    olderValue: a,
    newerValue: b,
    delta,
    days: Number(days.toFixed(3)),
    perDay: Number(perDay.toFixed(2)),
  };
}

function daysUntilFull(used, total, perDay) {
  if (used == null || total == null || perDay == null || perDay <= 0) {
    return null;
  }
  const remaining = total - used;
  if (remaining <= 0) return 0;
  return Number((remaining / perDay).toFixed(1));
}

async function buildForecast() {
  const snaps = await DevopsCapacitySnapshot.find({}).sort({ ts: -1 }).limit(120).lean();

  if (snaps.length < 2) {
    return {
      available: false,
      reason:
        'Insufficient snapshot history (need ≥2 samples). Growth/ETA stay null until the writer accumulates real data — not invented.',
      snapshotCount: snaps.length,
      samples: snaps.map((s) => ({ ts: s.ts })),
    };
  }

  const newest = snaps[0];
  const dayAgo = snaps.find((s) => new Date(newest.ts) - new Date(s.ts) >= 20 * 60 * 60 * 1000);
  const oldest = snaps[snaps.length - 1];
  const baseline = dayAgo || oldest;

  const diskGrowth = growthBetween(baseline, newest, 'disk.usedBytes');
  const mongoGrowth = growthBetween(baseline, newest, 'mongo.storageSize');
  const memGrowth = growthBetween(baseline, newest, 'memory.usedPct');

  return {
    available: true,
    snapshotCount: snaps.length,
    window: {
      from: baseline.ts,
      to: newest.ts,
      approxHours: Number(
        ((new Date(newest.ts) - new Date(baseline.ts)) / (60 * 60 * 1000)).toFixed(2)
      ),
    },
    disk: {
      growth: diskGrowth,
      daysUntilFull: daysUntilFull(
        newest.disk?.usedBytes,
        newest.disk?.totalBytes,
        diskGrowth?.perDay
      ),
    },
    mongo: {
      growth: mongoGrowth,
      daysUntilFull:
        newest.mongo?.fsTotalSize != null
          ? daysUntilFull(
              newest.mongo.fsUsedSize ?? newest.mongo.storageSize,
              newest.mongo.fsTotalSize,
              mongoGrowth?.perDay
            )
          : null,
      note:
        newest.mongo?.fsTotalSize == null
          ? 'No Mongo fsTotalSize — cannot estimate days-until-full for DB volume'
          : null,
    },
    memory: { growth: memGrowth },
    series: snaps
      .slice()
      .reverse()
      .map((s) => ({
        ts: s.ts,
        diskUsedBytes: s.disk?.usedBytes ?? null,
        diskPct: s.disk?.pctUsed ?? null,
        mongoStorageSize: s.mongo?.storageSize ?? null,
        memPct: s.memory?.usedPct ?? null,
        redisUsed: s.redis?.usedMemory ?? null,
      })),
  };
}

function buildAlerts(live, forecast) {
  const alerts = [];
  const push = (a) => alerts.push({ id: a.id, ...a });

  const diskPct = live.disk?.pctUsed;
  if (live.disk?.available && diskPct != null) {
    if (diskPct >= 90) {
      push({
        id: 'disk-critical',
        severity: 'critical',
        resource: 'disk',
        cause: `Disk ${diskPct}% used on ${live.disk.path}`,
        impact: 'Writes may fail; logs, uploads, and Mongo local files at risk',
        action: 'Free space, rotate logs, or expand volume',
        eta:
          forecast?.disk?.daysUntilFull != null
            ? `~${forecast.disk.daysUntilFull} days to full at current growth`
            : 'ETA unknown (need growth history)',
        health: 'red',
      });
    } else if (diskPct >= 80) {
      push({
        id: 'disk-warning',
        severity: 'warning',
        resource: 'disk',
        cause: `Disk ${diskPct}% used on ${live.disk.path}`,
        impact: 'Headroom shrinking for deploy artifacts and logs',
        action: 'Plan cleanup or volume expansion',
        eta:
          forecast?.disk?.daysUntilFull != null
            ? `~${forecast.disk.daysUntilFull} days to full`
            : 'ETA unknown',
        health: 'yellow',
      });
    }
  }

  const mongoPct = live.mongodb?.pctUsed;
  if (live.mongodb?.available && mongoPct != null) {
    if (mongoPct >= 95) {
      push({
        id: 'mongo-critical',
        severity: 'critical',
        resource: 'mongodb',
        cause: `Mongo filesystem ${mongoPct}% used`,
        impact: 'Database writes may fail',
        action: 'Compact, drop unused indexes, or upgrade cluster storage',
        eta:
          forecast?.mongo?.daysUntilFull != null
            ? `~${forecast.mongo.daysUntilFull} days to full`
            : 'ETA unknown',
        health: 'red',
      });
    } else if (mongoPct >= 85) {
      push({
        id: 'mongo-high',
        severity: 'critical',
        resource: 'mongodb',
        cause: `Mongo filesystem ${mongoPct}% used`,
        impact: 'Approaching storage ceiling',
        action: 'Review largest collections; plan scale-up',
        eta:
          forecast?.mongo?.daysUntilFull != null
            ? `~${forecast.mongo.daysUntilFull} days to full`
            : 'ETA unknown',
        health: 'red',
      });
    } else if (mongoPct >= 70) {
      push({
        id: 'mongo-warning',
        severity: 'warning',
        resource: 'mongodb',
        cause: `Mongo filesystem ${mongoPct}% used`,
        impact: 'Elevated storage pressure',
        action: 'Monitor growth; prune TTL collections',
        eta:
          forecast?.mongo?.daysUntilFull != null
            ? `~${forecast.mongo.daysUntilFull} days to full`
            : 'ETA unknown',
        health: 'yellow',
      });
    }
  }

  const ramPct = live.memory?.os?.usedPct;
  if (live.memory?.available && ramPct != null && ramPct >= 85) {
    push({
      id: 'ram-high',
      severity: ramPct >= 95 ? 'critical' : 'warning',
      resource: 'memory',
      cause: `OS RAM ${ramPct}% used`,
      impact: 'Risk of OOM / swap thrash affecting API latency',
      action: 'Inspect Node heap, Redis, and concurrent workers',
      eta: 'Immediate if sustained',
      health: ramPct >= 95 ? 'red' : 'yellow',
    });
  }

  if (live.redis?.available && live.redis.pctUsed != null && live.redis.pctUsed >= 85) {
    push({
      id: 'redis-high',
      severity: live.redis.pctUsed >= 95 ? 'critical' : 'warning',
      resource: 'redis',
      cause: `Redis memory ${live.redis.pctUsed}% of ${live.redis.limitSource}`,
      impact: 'Cache evictions / write failures',
      action: 'Raise maxmemory or reduce cache TTLs / keys',
      eta: 'Immediate if maxmemory policy is noeviction',
      health: live.redis.pctUsed >= 95 ? 'red' : 'yellow',
    });
  }

  if (live.queue?.available && live.queue.health === 'red') {
    push({
      id: 'queue-down',
      severity: 'critical',
      resource: 'queue',
      cause: 'Agenda worker not started or Mongo disconnected',
      impact: 'Emails / booking integrations will not process',
      action: 'Check backend boot logs and Agenda start()',
      eta: 'Until worker restarts',
      health: 'red',
    });
  }

  const diskPerDay = forecast?.disk?.growth?.perDay;
  if (diskPerDay != null && live.disk?.available) {
    const dayBytes = live.disk.totalBytes * 0.02; // 2% of disk in one day = spike
    if (diskPerDay > dayBytes && dayBytes > 0) {
      push({
        id: 'disk-growth-spike',
        severity: 'warning',
        resource: 'disk',
        cause: `Disk growth ~${Math.round(diskPerDay / (1024 * 1024))} MB/day (elevated vs 2% daily)`,
        impact: 'Accelerated time-to-full',
        action: 'Identify large writers (logs, uploads, backups)',
        eta:
          forecast.disk.daysUntilFull != null
            ? `~${forecast.disk.daysUntilFull} days`
            : 'ETA unknown',
        health: 'yellow',
      });
    }
  }

  const order = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  return alerts;
}

function overallHealth(parts) {
  const lights = parts.filter(Boolean);
  if (lights.includes('red')) return 'red';
  if (lights.includes('yellow')) return 'yellow';
  if (lights.every((l) => l === 'unknown')) return 'unknown';
  return 'green';
}

async function collectLive() {
  const [disk, memory, redis, mongodb, queue, cloud, appDisk] = await Promise.all([
    collectDisk(),
    collectOsMemory(),
    collectRedis(),
    collectMongoDb(),
    collectQueue(),
    collectCloud(),
    collectAppDiskSizes(),
  ]);

  const appsMongo = mongodb.available
    ? mongoAppsBreakdown(mongodb.collections || [])
    : {
        available: false,
        reason: mongodb.reason || 'Mongo unavailable',
      };

  const live = {
    collectedAt: new Date().toISOString(),
    disk,
    memory,
    redis,
    mongodb,
    queue,
    cloud,
    apps: {
      mongo: appsMongo,
      filesystem: appDisk,
    },
  };

  // Fire-and-forget snapshot (throttled)
  void maybePersistSnapshot(live);

  return live;
}

async function getLiveCached({ force = false } = {}) {
  const now = Date.now();
  if (!force && memCache.payload && now - memCache.at < CACHE_TTL_MS) {
    return {
      ...memCache.payload,
      cache: { hit: true, ageMs: now - memCache.at },
    };
  }

  if (force) {
    memCache = { at: 0, payload: null };
  }

  // Single-flight so parallel /capacity/*?fresh=1 calls share one collectLive.
  if (!collectInFlight) {
    collectInFlight = collectLive()
      .then((live) => {
        memCache = { at: Date.now(), payload: live };
        return live;
      })
      .finally(() => {
        collectInFlight = null;
      });
  }

  const live = await collectInFlight;
  return {
    ...live,
    cache: {
      hit: false,
      ageMs: 0,
      forced: force,
    },
  };
}

/** Clear in-memory capacity cache (e.g. after deploy / debugging stale KPI). */
export function invalidateCapacityCache() {
  memCache = { at: 0, payload: null };
  dirSizeCache = { at: 0, payload: null };
}

export async function getCapacityOverview({ force = false } = {}) {
  const live = await getLiveCached({ force });
  const forecast = await buildForecast();
  const alerts = buildAlerts(live, forecast);

  const kpis = [
    {
      id: 'disk',
      label: 'Host disk (Node process machine)',
      health: live.disk.health,
      usedBytes: live.disk.usedBytes ?? null,
      totalBytes: live.disk.totalBytes ?? null,
      freeBytes: live.disk.freeBytes ?? null,
      pctUsed: live.disk.pctUsed ?? null,
      available: live.disk.available,
      reason: live.disk.reason,
      note: live.disk.note,
      hostname: live.disk.hostname,
    },
    {
      id: 'mongo',
      label: 'MongoDB used',
      health: live.mongodb.health,
      usedBytes:
        live.mongodb.totalUsedBytes ?? live.mongodb.storageSize ?? live.mongodb.dataSize ?? null,
      dataSize: live.mongodb.dataSize ?? null,
      indexSize: live.mongodb.indexSize ?? null,
      freeBytes: live.mongodb.freeBytes ?? null,
      totalBytes: live.mongodb.fsTotalSize ?? null,
      pctUsed: live.mongodb.pctUsed ?? null,
      available: live.mongodb.available,
      reason: live.mongodb.reason || live.mongodb.note,
      quotaKnown: live.mongodb.quotaKnown === true,
      dbName: live.mongodb.dbName,
    },
    {
      id: 'ram',
      label: 'Host RAM (Node process machine)',
      health: live.memory?.os?.health,
      usedBytes: live.memory?.os?.usedBytes ?? null,
      totalBytes: live.memory?.os?.totalBytes ?? null,
      freeBytes: live.memory?.os?.freeBytes ?? null,
      pctUsed: live.memory?.os?.usedPct ?? null,
      available: live.memory?.available !== false,
      note: live.memory?.note,
      hostname: live.memory?.hostname,
    },
    {
      id: 'redis',
      label: 'Redis memory',
      health: live.redis.health,
      usedBytes: live.redis.usedMemory ?? null,
      totalBytes: live.redis.maxMemory ?? live.redis.totalSystemMemory ?? null,
      pctUsed: live.redis.pctUsed ?? null,
      available: live.redis.available,
      reason: live.redis.reason || live.redis.note,
    },
    {
      id: 'cpu',
      label: 'Host CPU load',
      health: live.memory?.cpu?.health,
      load1: live.memory?.cpu?.load1 ?? null,
      cores: live.memory?.cpu?.cores ?? null,
      loadPerCore: live.memory?.cpu?.loadPerCore ?? null,
      available: live.memory?.cpu?.health !== 'unknown',
      reason:
        live.memory?.cpu?.health === 'unknown'
          ? 'CPU loadavg unreliable on this host (common on Windows)'
          : null,
    },
    {
      id: 'queue',
      label: 'Job queue',
      health: live.queue.health,
      available: live.queue.available,
      totals: {
        total: live.queue.totals?.totalJobs ?? live.queue.totals?.total ?? null,
        withFailureHistory:
          live.queue.totals?.failedJobs ?? live.queue.totals?.withFailureHistory ?? null,
        totalJobs: live.queue.totals?.totalJobs ?? null,
        failedJobs: live.queue.totals?.failedJobs ?? null,
      },
      reason: live.queue.reason,
    },
  ];

  return {
    overallHealth: overallHealth(kpis.map((k) => k.health)),
    host: {
      hostname: live.disk?.hostname || live.memory?.hostname || os.hostname(),
      platform: process.platform,
      note: 'Host metrics = machine running the backend process. Mongo metrics = connected database.',
    },
    kpis,
    alertsSummary: {
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      total: alerts.length,
    },
    forecastAvailable: forecast.available,
    forecastReason: forecast.reason || null,
    cloudAvailable: live.cloud.available,
    collectedAt: live.collectedAt,
    cache: live.cache,
  };
}

export async function getCapacityMongodb({ force = false } = {}) {
  const live = await getLiveCached({ force });
  return {
    collectedAt: live.collectedAt,
    cache: live.cache,
    ...live.mongodb,
    top20: live.mongodb.top20 || [],
  };
}

export async function getCapacityCollections({ force = false } = {}) {
  const live = await getLiveCached({ force });
  return {
    collectedAt: live.collectedAt,
    cache: live.cache,
    available: live.mongodb.available,
    reason: live.mongodb.reason,
    collections: live.mongodb.collections || [],
    top20: live.mongodb.top20 || [],
  };
}

export async function getCapacityDisk({ force = false } = {}) {
  const live = await getLiveCached({ force });
  return {
    collectedAt: live.collectedAt,
    cache: live.cache,
    ...live.disk,
  };
}

export async function getCapacityMemory({ force = false } = {}) {
  const live = await getLiveCached({ force });
  return {
    collectedAt: live.collectedAt,
    cache: live.cache,
    memory: live.memory,
    redis: live.redis,
    queue: live.queue,
  };
}

export async function getCapacityForecast({ force = false } = {}) {
  const live = await getLiveCached({ force });
  const forecast = await buildForecast();
  return {
    collectedAt: live.collectedAt,
    liveHints: {
      diskPct: live.disk?.pctUsed ?? null,
      mongoPct: live.mongodb?.pctUsed ?? null,
      mongoStorageSize: live.mongodb?.storageSize ?? null,
    },
    ...forecast,
  };
}

export async function getCapacityAlerts({ force = false } = {}) {
  const live = await getLiveCached({ force });
  const forecast = await buildForecast();
  const alerts = buildAlerts(live, forecast);
  return {
    collectedAt: live.collectedAt,
    overallHealth: overallHealth([
      live.disk?.health,
      live.mongodb?.health,
      live.memory?.os?.health,
      live.redis?.health,
      live.queue?.health,
    ]),
    alerts,
  };
}

export async function getCapacityApps({ force = false } = {}) {
  const live = await getLiveCached({ force });
  return {
    collectedAt: live.collectedAt,
    cache: live.cache,
    ...live.apps,
  };
}

export async function getCapacityCloud({ force = false } = {}) {
  const live = await getLiveCached({ force });
  return {
    collectedAt: live.collectedAt,
    cache: live.cache,
    ...live.cloud,
  };
}
