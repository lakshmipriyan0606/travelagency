/**
 * Priority 0 — Executive Operations Center (NOC) summary.
 * Real telemetry only; missing sources → available:false / unavailable fields.
 */
import mongoose from 'mongoose';
import os from 'os';
import cache from '#config/cache.js';
import { getQueueHealthDetail, getQueuePublicSnapshot } from '#config/queueRuntime.js';
import ApiHit from '#b2c/analytics/apiHit.model.js';
import Visitor from '#b2c/analytics/visitor.model.js';
import Booking from '#b2c/bookings/booking.model.js';
import QuoteRequest from '#b2b/models/quoteRequest.model.js';
import DevopsRequestLog from '../models/devopsRequestLog.model.js';
import DevopsErrorEvent from '../models/devopsErrorEvent.model.js';
import DevopsAuditLog from '../models/devopsAuditLog.model.js';
import { getCapacityOverview, getCapacityCloud, getCapacityAlerts } from './capacity.service.js';

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function startOfUtcDay() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function redisPing() {
  try {
    const pong = await cache.ping();
    return pong === 'PONG' ? 'up' : 'degraded';
  } catch {
    return 'down';
  }
}

function lightFromStatus(status) {
  if (status === 'up' || status === 'green' || status === 'healthy') return 'green';
  if (
    status === 'degraded' ||
    status === 'yellow' ||
    status === 'connecting' ||
    status === 'warning'
  )
    return 'yellow';
  if (status === 'unknown' || status == null) return 'unknown';
  return 'red';
}

function worstLight(...lights) {
  const rank = { red: 3, yellow: 2, unknown: 1, green: 0 };
  let worst = 'green';
  for (const l of lights) {
    const x = l || 'unknown';
    if ((rank[x] ?? 1) > (rank[worst] ?? 0)) worst = x;
  }
  return worst;
}

function healthScoreFrom({ overallLight, errorRate, openCritical, openErrors }) {
  let score = 100;
  if (overallLight === 'red') score -= 45;
  else if (overallLight === 'yellow') score -= 20;
  else if (overallLight === 'unknown') score -= 10;
  score -= Math.min(30, Math.round(errorRate * 2));
  score -= Math.min(20, openCritical * 10);
  score -= Math.min(10, Math.floor(openErrors / 5));
  return Math.max(0, Math.min(100, score));
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export async function getInfraHealth() {
  const mongoState = mongoose.connection.readyState;
  const mongo = mongoState === 1 ? 'up' : mongoState === 2 ? 'connecting' : 'down';
  const redis = await redisPing();
  const queue = getQueuePublicSnapshot();
  const mem = process.memoryUsage();
  const overall =
    mongo === 'up' && redis !== 'down' ? 'healthy' : mongo === 'up' ? 'degraded' : 'critical';
  return {
    mongo,
    redis,
    queue,
    server: {
      uptimeSec: Math.round(process.uptime()),
      node: process.version,
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      loadAvg: os.loadavg?.() || [],
      freeMemMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
      cpuCount: os.cpus()?.length || null,
    },
    overall,
  };
}

export async function getAppsHealth() {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const byApp = await DevopsRequestLog.aggregate([
    { $match: { ts: { $gte: since } } },
    {
      $group: {
        _id: '$app',
        requests: { $sum: 1 },
        errors: { $sum: { $cond: [{ $gte: ['$status', 500] }, 1, 0] } },
        avgMs: { $avg: '$durationMs' },
      },
    },
  ]);
  const map = Object.fromEntries(byApp.map((r) => [r._id, r]));
  const mk = (app) => {
    const row = map[app];
    if (!row) return { app, status: 'unknown', requests: 0, errors: 0, avgMs: 0 };
    const errRate = row.requests ? row.errors / row.requests : 0;
    const status = errRate > 0.05 ? 'red' : errRate > 0.01 || row.avgMs > 1500 ? 'yellow' : 'green';
    return {
      app,
      status,
      requests: row.requests,
      errors: row.errors,
      avgMs: Math.round(row.avgMs || 0),
    };
  };
  return {
    b2c: mk('b2c'),
    b2b: mk('b2b'),
    admin: mk('admin'),
    api: mk('system'),
  };
}

async function requestWindowStats(since) {
  const rows = await DevopsRequestLog.aggregate([
    { $match: { ts: { $gte: since } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        errors4xx: {
          $sum: {
            $cond: [{ $and: [{ $gte: ['$status', 400] }, { $lt: ['$status', 500] }] }, 1, 0],
          },
        },
        errors5xx: { $sum: { $cond: [{ $gte: ['$status', 500] }, 1, 0] } },
        timeouts: {
          $sum: { $cond: [{ $gte: ['$durationMs', 30000] }, 1, 0] },
        },
        slow: { $sum: { $cond: [{ $gte: ['$durationMs', 2000] }, 1, 0] } },
        avgMs: { $avg: '$durationMs' },
        durations: { $push: '$durationMs' },
      },
    },
  ]);
  const row = rows[0] || {
    total: 0,
    errors4xx: 0,
    errors5xx: 0,
    timeouts: 0,
    slow: 0,
    avgMs: 0,
    durations: [],
  };
  const sorted = (row.durations || []).filter((n) => typeof n === 'number').sort((a, b) => a - b);
  const errors = (row.errors4xx || 0) + (row.errors5xx || 0);
  const successRate = row.total ? ((row.total - errors) / row.total) * 100 : 100;
  const errorRate = row.total ? (errors / row.total) * 100 : 0;
  const windowSec = Math.max(1, (Date.now() - since.getTime()) / 1000);
  return {
    total: row.total,
    errors4xx: row.errors4xx || 0,
    errors5xx: row.errors5xx || 0,
    timeouts: row.timeouts || 0,
    slow: row.slow || 0,
    avgMs: Math.round(row.avgMs || 0),
    p95Ms: percentile(sorted, 95),
    p99Ms: percentile(sorted, 99),
    successRate: Number(successRate.toFixed(2)),
    errorRate: Number(errorRate.toFixed(2)),
    rps: Number((row.total / windowSec).toFixed(3)),
    rpm: Number(((row.total / windowSec) * 60).toFixed(2)),
    source: 'devops_request_logs_sampled',
  };
}

async function buildLiveFeed() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [errors, audits, fails5xx, queueDetail] = await Promise.all([
    DevopsErrorEvent.find({ lastSeenAt: { $gte: since } })
      .sort({ lastSeenAt: -1 })
      .limit(12)
      .lean(),
    DevopsAuditLog.find({ ts: { $gte: since } })
      .sort({ ts: -1 })
      .limit(8)
      .lean(),
    DevopsRequestLog.find({ ts: { $gte: since }, status: { $gte: 500 } })
      .sort({ ts: -1 })
      .limit(8)
      .lean(),
    getQueueHealthDetail(),
  ]);

  const events = [];

  for (const e of errors) {
    events.push({
      type: 'error',
      severity: e.count > 20 ? 'critical' : 'high',
      title: e.message?.slice(0, 120) || 'Error',
      service: e.app || e.source || 'api',
      ts: e.lastSeenAt,
      meta: { fingerprint: e.fingerprint, count: e.count, status: e.status },
    });
  }
  for (const a of audits) {
    events.push({
      type: a.action?.includes('auth') ? 'login' : 'audit',
      severity: a.result === 'denied' ? 'medium' : 'low',
      title: a.action,
      service: a.module || 'devops',
      ts: a.ts,
      meta: { result: a.result, ip: a.ip },
    });
  }
  for (const r of fails5xx) {
    events.push({
      type: 'error',
      severity: 'high',
      title: `${r.method || 'HTTP'} ${r.path || r.route || ''} → ${r.status}`,
      service: r.app || 'api',
      ts: r.ts,
      meta: { durationMs: r.durationMs, status: r.status },
    });
  }
  for (const f of queueDetail.recentFailures || []) {
    events.push({
      type: 'queue_failure',
      severity: 'high',
      title: `Queue job failed: ${f.name || 'job'}`,
      service: 'worker',
      ts: f.lastFinishedAt || f.failedAt || new Date(),
      meta: { failCount: f.failCount, failReason: f.failReason },
    });
  }

  events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  return events.slice(0, 25);
}

function buildIncidents({ openErrors, capacityAlerts, infra }) {
  const incidents = [];

  if (infra.mongo !== 'up') {
    incidents.push({
      id: 'mongo-down',
      incident: 'MongoDB connectivity',
      severity: 'critical',
      affectedService: 'mongodb',
      impact: 'All API and worker persistence degraded or unavailable',
      started: null,
      owner: 'platform',
      status: 'open',
      eta: null,
    });
  }
  if (infra.redis === 'down') {
    incidents.push({
      id: 'redis-down',
      incident: 'Redis unavailable',
      severity: 'critical',
      affectedService: 'redis',
      impact: 'Cache, OTP/challenge stores, and rate-limit backends may fail',
      started: null,
      owner: 'platform',
      status: 'open',
      eta: null,
    });
  }

  for (const a of capacityAlerts || []) {
    if (a.severity !== 'critical' && a.severity !== 'warning') continue;
    incidents.push({
      id: a.id || `cap-${a.resource}`,
      incident: a.cause || a.title || 'Capacity alert',
      severity: a.severity === 'critical' ? 'critical' : 'high',
      affectedService: a.resource || a.component || a.id || 'infra',
      impact: a.impact || '',
      started: a.at || null,
      owner: 'sre',
      status: 'open',
      eta: a.eta || null,
      recommendedAction: a.action || null,
    });
  }

  for (const e of openErrors.slice(0, 8)) {
    incidents.push({
      id: e.fingerprint,
      incident: e.message?.slice(0, 100) || 'Open error fingerprint',
      severity: e.count > 50 ? 'critical' : e.count > 10 ? 'high' : 'medium',
      affectedService: e.app || e.source || 'api',
      impact: `${e.count} occurrences · last ${e.lastSeenAt?.toISOString?.() || e.lastSeenAt}`,
      started: e.firstSeenAt || null,
      owner: 'engineering',
      status: e.status || 'open',
      eta: null,
    });
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  incidents.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  return incidents.slice(0, 15);
}

/**
 * Priority 0 NOC payload — answers production health in one response.
 */
export async function getExecutiveSummary({ from, to } = {}) {
  const start = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const end = to ? new Date(to) : new Date();
  const date = todayUtc();
  const dayStart = startOfUtcDay();
  const last15m = new Date(Date.now() - 15 * 60 * 1000);
  const last60m = new Date(Date.now() - 60 * 60 * 1000);

  const [
    infra,
    apps,
    stats15,
    stats60,
    statsDay,
    openErrorDocs,
    openErrorCount,
    todayHits,
    todayVisitors,
    bookingsToday,
    failedBookingJobs,
    quotesToday,
    queueDetail,
    capacity,
    capacityAlertPack,
    cloud,
    liveFeed,
  ] = await Promise.all([
    getInfraHealth(),
    getAppsHealth(),
    requestWindowStats(last15m),
    requestWindowStats(last60m),
    requestWindowStats(dayStart),
    DevopsErrorEvent.find({ status: 'open' }).sort({ lastSeenAt: -1 }).limit(20).lean(),
    DevopsErrorEvent.countDocuments({ status: 'open' }),
    ApiHit.aggregate([{ $match: { date } }, { $group: { _id: null, count: { $sum: '$count' } } }]),
    Visitor.countDocuments({ date }),
    Booking.countDocuments({ createdAt: { $gte: dayStart } }),
    Booking.countDocuments({
      createdAt: { $gte: dayStart },
      $or: [
        { sheetSyncStatus: 'Failed' },
        { userEmailStatus: 'Failed' },
        { adminEmailStatus: 'Failed' },
      ],
    }),
    QuoteRequest.countDocuments({ createdAt: { $gte: dayStart } }).catch(() => 0),
    getQueueHealthDetail(),
    getCapacityOverview().catch((err) => ({
      available: false,
      reason: err?.message || 'capacity_unavailable',
      overallHealth: 'unknown',
      kpis: [],
      alertsSummary: { critical: 0, warning: 0, total: 0 },
    })),
    getCapacityAlerts().catch(() => ({
      alerts: [],
      alertsSummary: { critical: 0, warning: 0, total: 0 },
    })),
    getCapacityCloud().catch(() => ({ available: false, reason: 'cloud_unavailable' })),
    buildLiveFeed(),
  ]);

  const capacityAlerts = capacityAlertPack?.alerts || [];
  const alertCritical = capacityAlerts.filter((a) => a.severity === 'critical').length;
  const alertWarning = capacityAlerts.filter((a) => a.severity === 'warning').length;

  const kpiById = Object.fromEntries((capacity.kpis || []).map((k) => [k.id, k]));
  const diskLight = lightFromStatus(kpiById.disk?.health);
  const mongoCapLight = lightFromStatus(kpiById.mongo?.health);
  const ramLight = lightFromStatus(kpiById.ram?.health);
  const redisCapLight = lightFromStatus(kpiById.redis?.health);
  const cpuLight = lightFromStatus(kpiById.cpu?.health);
  const queueCapLight = lightFromStatus(kpiById.queue?.health);

  const mongoLight = worstLight(lightFromStatus(infra.mongo), mongoCapLight);
  const redisLight = worstLight(lightFromStatus(infra.redis), redisCapLight);
  const queueLight = worstLight(
    infra.queue?.agendaWorkerStarted ? 'green' : 'yellow',
    queueCapLight
  );
  const cloudLight = cloud?.available ? lightFromStatus(cloud.health || 'green') : 'unknown';

  const appLights = [apps.b2c?.status, apps.b2b?.status, apps.admin?.status, apps.api?.status].map(
    lightFromStatus
  );

  const overallLight = worstLight(
    lightFromStatus(
      infra.overall === 'healthy' ? 'green' : infra.overall === 'degraded' ? 'yellow' : 'red'
    ),
    mongoLight,
    redisLight,
    ...appLights,
    diskLight,
    ramLight,
    cpuLight,
    capacity.overallHealth === 'red' || capacity.overallHealth === 'critical'
      ? 'red'
      : capacity.overallHealth === 'yellow' || capacity.overallHealth === 'warning'
        ? 'yellow'
        : capacity.overallHealth === 'green' || capacity.overallHealth === 'healthy'
          ? 'green'
          : 'unknown'
  );

  const openCritical =
    alertCritical + (infra.mongo !== 'up' ? 1 : 0) + (infra.redis === 'down' ? 1 : 0);

  const score = healthScoreFrom({
    overallLight,
    errorRate: stats15.errorRate,
    openCritical,
    openErrors: openErrorCount,
  });

  const statusLabel =
    overallLight === 'green'
      ? 'Healthy'
      : overallLight === 'yellow'
        ? 'Warning'
        : overallLight === 'red'
          ? 'Critical'
          : 'Unknown';

  const availabilityPct = statsDay.successRate;
  // Sample-based SLO: target 99.9% success over UTC day samples
  const sloTarget = 99.9;
  const errorBudgetRemaining = Number((availabilityPct - (100 - sloTarget)).toFixed(3));

  const queueFailTotal = Object.values(queueDetail.jobs || {}).reduce(
    (n, j) => n + (j.withFailureHistory || 0),
    0
  );

  const applicationCards = [
    {
      id: 'b2c',
      name: 'B2C Website',
      status: apps.b2c?.status || 'unknown',
      version: process.env.npm_package_version || null,
      uptimeSec: null,
      requests: apps.b2c?.requests ?? 0,
      errors: apps.b2c?.errors ?? 0,
      avgResponseMs: apps.b2c?.avgMs ?? 0,
      lastDeployment: { available: false, reason: 'deploy_telemetry_not_wired' },
      lastRestart: { available: false, reason: 'pm2_metrics_not_wired' },
      window: '15m_samples',
    },
    {
      id: 'b2b',
      name: 'B2B Portal',
      status: apps.b2b?.status || 'unknown',
      version: null,
      uptimeSec: null,
      requests: apps.b2b?.requests ?? 0,
      errors: apps.b2b?.errors ?? 0,
      avgResponseMs: apps.b2b?.avgMs ?? 0,
      lastDeployment: { available: false, reason: 'deploy_telemetry_not_wired' },
      lastRestart: { available: false, reason: 'pm2_metrics_not_wired' },
      window: '15m_samples',
    },
    {
      id: 'admin',
      name: 'Admin Portal',
      status: apps.admin?.status || 'unknown',
      version: null,
      uptimeSec: null,
      requests: apps.admin?.requests ?? 0,
      errors: apps.admin?.errors ?? 0,
      avgResponseMs: apps.admin?.avgMs ?? 0,
      lastDeployment: { available: false, reason: 'deploy_telemetry_not_wired' },
      lastRestart: { available: false, reason: 'pm2_metrics_not_wired' },
      window: '15m_samples',
    },
    {
      id: 'backend',
      name: 'Backend API',
      status: apps.api?.status || lightFromStatus(infra.overall),
      version: process.env.npm_package_version || null,
      uptimeSec: infra.server.uptimeSec,
      requests: apps.api?.requests ?? 0,
      errors: apps.api?.errors ?? 0,
      avgResponseMs: apps.api?.avgMs ?? 0,
      lastDeployment: { available: false, reason: 'deploy_telemetry_not_wired' },
      lastRestart: {
        available: true,
        uptimeSec: infra.server.uptimeSec,
        note: 'process uptime since last start',
      },
      node: infra.server.node,
      window: '15m_samples',
    },
    {
      id: 'worker',
      name: 'Worker Service',
      status: infra.queue?.agendaWorkerStarted ? 'green' : 'yellow',
      version: null,
      uptimeSec: null,
      requests: null,
      errors: queueFailTotal,
      avgResponseMs: null,
      lastDeployment: { available: false, reason: 'deploy_telemetry_not_wired' },
      lastRestart: {
        available: Boolean(infra.queue?.agendaMarkedStartedAt),
        at: infra.queue?.agendaMarkedStartedAt || null,
      },
      note: infra.queue?.agendaWorkerStarted
        ? 'Agenda worker marked started'
        : 'Agenda worker not marked started in this process',
    },
    {
      id: 'cron',
      name: 'Cron Jobs',
      status: infra.queue?.agendaWorkerStarted ? 'green' : 'yellow',
      jobs: queueDetail.jobs || {},
      errors: queueFailTotal,
      lastDeployment: { available: false, reason: 'n/a' },
      lastRestart: { available: false, reason: 'n/a' },
    },
    {
      id: 'redis',
      name: 'Redis',
      status: redisLight,
      version: cloud?.redisVersion || null,
      uptimeSec: null,
      memoryPct: kpiById.redis?.pctUsed ?? null,
      usedBytes: kpiById.redis?.usedBytes ?? null,
      available: kpiById.redis?.available !== false,
      reason: kpiById.redis?.reason,
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      status: mongoLight,
      storagePct: kpiById.mongo?.pctUsed ?? null,
      usedBytes: kpiById.mongo?.usedBytes ?? null,
      available: kpiById.mongo?.available !== false,
      reason: kpiById.mongo?.reason,
      connection: infra.mongo,
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      status: cloudLight,
      available: Boolean(cloud?.available),
      reason: cloud?.reason || null,
      usage: cloud?.available ? cloud.summary || cloud : null,
    },
  ];

  const infraSummary = {
    cpu: {
      light: cpuLight,
      load1: infra.server.loadAvg?.[0] ?? null,
      cores: infra.server.cpuCount,
      pct:
        kpiById.cpu?.loadPerCore != null
          ? Number((kpiById.cpu.loadPerCore * 100).toFixed(1))
          : null,
    },
    memory: {
      light: ramLight,
      usedPct: kpiById.ram?.pctUsed ?? null,
      freeMemMb: infra.server.freeMemMb,
      totalMemMb: infra.server.totalMemMb,
      heapUsedMb: infra.server.heapUsedMb,
    },
    disk: {
      light: diskLight,
      pctUsed: kpiById.disk?.pctUsed ?? null,
      freeBytes: kpiById.disk?.freeBytes ?? null,
      available: kpiById.disk?.available,
      reason: kpiById.disk?.reason,
    },
    database: {
      light: mongoLight,
      connection: infra.mongo,
      pctUsed: kpiById.mongo?.pctUsed ?? null,
    },
    redis: { light: redisLight, connection: infra.redis, pctUsed: kpiById.redis?.pctUsed ?? null },
    network: {
      light: 'unknown',
      available: false,
      reason: 'os_network_counters_not_wired',
    },
    workers: {
      light: queueLight,
      agendaWorkerStarted: Boolean(infra.queue?.agendaWorkerStarted),
    },
    storage: {
      light: worstLight(diskLight, mongoCapLight, cloudLight),
      diskPct: kpiById.disk?.pctUsed ?? null,
      mongoPct: kpiById.mongo?.pctUsed ?? null,
    },
    queue: {
      light: queueLight,
      totals: kpiById.queue?.totals || null,
      failJobs: queueFailTotal,
    },
  };

  const apiSummary = {
    totalRequestsToday: todayHits[0]?.count ?? statsDay.total,
    sampledToday: statsDay.total,
    sampledNote: 'Latency/RPS from sampled devops_request_logs; totals prefer ApiHit when present',
    rps: stats15.rps,
    rpm: stats15.rpm,
    successRate: stats15.successRate,
    errorRate: stats15.errorRate,
    avgMs: stats15.avgMs,
    p95Ms: stats15.p95Ms,
    p99Ms: stats15.p99Ms,
    timeouts: stats15.timeouts,
    slowRequests: stats15.slow,
    window: '15m',
    lastHour: {
      total: stats60.total,
      errorRate: stats60.errorRate,
      avgMs: stats60.avgMs,
    },
  };

  const businessHealth = {
    bookingsToday,
    failedBookings: failedBookingJobs,
    quotesToday,
    paymentsToday: { available: false, reason: 'payment_ledger_not_in_booking_model' },
    revenueToday: { available: false, reason: 'revenue_telemetry_not_wired' },
    failedPayments: { available: false, reason: 'payment_ledger_not_wired' },
    conversion: { available: false, reason: 'needs_visitor_to_booking_funnel_rollup' },
    visitorsToday: todayVisitors,
    trafficNormal: todayVisitors === 0 ? 'unknown' : todayVisitors < 3 ? 'low' : 'normal',
    topBusinessErrors: openErrorDocs
      .filter((e) => e.app === 'b2c' || e.app === 'b2b' || e.source === 'api')
      .slice(0, 5)
      .map((e) => ({
        fingerprint: e.fingerprint,
        message: e.message,
        count: e.count,
        app: e.app,
        lastSeenAt: e.lastSeenAt,
      })),
  };

  const incidents = buildIncidents({
    openErrors: openErrorDocs,
    capacityAlerts: Array.isArray(capacityAlerts) ? capacityAlerts : [],
    infra,
  });

  const quickActions = [
    { id: 'health', label: 'Run Health Check', kind: 'refresh', enabled: true },
    { id: 'logs', label: 'View Logs', kind: 'link', href: '/devops/logs', enabled: true },
    { id: 'errors', label: 'Open Errors', kind: 'link', href: '/devops/errors', enabled: true },
    { id: 'api', label: 'API Monitor', kind: 'link', href: '/devops/api', enabled: true },
    { id: 'capacity', label: 'Capacity', kind: 'link', href: '/devops/capacity', enabled: true },
    {
      id: 'sentry',
      label: 'Open Sentry',
      kind: 'external',
      href: process.env.SENTRY_UI_URL || null,
      enabled: Boolean(process.env.SENTRY_UI_URL),
      reason: process.env.SENTRY_UI_URL ? null : 'SENTRY_UI_URL not set',
    },
    {
      id: 'grafana',
      label: 'Open Grafana',
      kind: 'external',
      href: process.env.GRAFANA_URL || null,
      enabled: Boolean(process.env.GRAFANA_URL),
      reason: process.env.GRAFANA_URL ? null : 'GRAFANA_URL not set',
    },
    {
      id: 'restart',
      label: 'Restart Service',
      kind: 'action',
      enabled: false,
      reason: 'destructive_ops_not_enabled',
    },
    {
      id: 'clear-cache',
      label: 'Clear Cache',
      kind: 'action',
      enabled: false,
      reason: 'destructive_ops_not_enabled',
    },
    {
      id: 'pause-queue',
      label: 'Pause Queue',
      kind: 'action',
      enabled: false,
      reason: 'destructive_ops_not_enabled',
    },
    {
      id: 'resume-queue',
      label: 'Resume Queue',
      kind: 'action',
      enabled: false,
      reason: 'destructive_ops_not_enabled',
    },
  ];

  return {
    overall: {
      status: statusLabel,
      light: overallLight,
      healthScore: score,
      availabilityPct,
      incidentCount: incidents.filter((i) => i.severity === 'critical' || i.severity === 'high')
        .length,
      alertCount: capacityAlerts.length || capacity.alertsSummary?.total || incidents.length,
      openCriticalIssues: openCritical,
      openErrors: openErrorCount,
      answers: {
        productionHealthy: overallLight === 'green',
        appsWithProblems: applicationCards
          .filter((a) => a.status === 'red' || a.status === 'yellow')
          .map((a) => a.id),
        infrastructureHealthy:
          worstLight(diskLight, ramLight, cpuLight, mongoLight, redisLight) !== 'red',
        apisHealthy: lightFromStatus(apps.api?.status) !== 'red',
        databaseHealthy: mongoLight !== 'red',
        redisHealthy: redisLight !== 'red',
        queuesHealthy: queueLight !== 'red',
        bookingsPaymentsWorking:
          failedBookingJobs === 0
            ? businessHealth.paymentsToday.available === false
              ? 'partial_bookings_ok_payments_unknown'
              : true
            : false,
        customerTrafficNormal: businessHealth.trafficNormal,
        criticalAlertActive: openCritical > 0 || overallLight === 'red',
      },
    },
    applications: applicationCards,
    infrastructure: infraSummary,
    api: apiSummary,
    business: businessHealth,
    liveFeed,
    incidents,
    quickActions,
    sla: {
      availabilityPct,
      latencyP95Ms: stats15.p95Ms,
      latencyP99Ms: stats15.p99Ms,
      errorBudgetRemainingPct: errorBudgetRemaining,
      sloTargetPct: sloTarget,
      monthlySla: {
        available: false,
        reason: 'needs_persistent_monthly_rollups',
      },
      weeklySla: {
        available: false,
        reason: 'needs_persistent_weekly_rollups',
      },
      burnRate: {
        available: false,
        reason: 'needs_error_budget_timeseries',
      },
      note: 'Availability/latency derived from sampled request logs for the active windows — not a formal SLO burn until P2 rollups ship',
    },
    filters: {
      environment: process.env.NODE_ENV || 'development',
      applications: ['b2c', 'b2b', 'admin', 'backend', 'all'],
      region: process.env.DEVOPS_REGION || null,
      range: { from: start.toISOString(), to: end.toISOString() },
    },
    meta: {
      collectedAt: new Date().toISOString(),
      capacityCollectedAt: capacity.collectedAt || null,
      packageVersion: process.env.npm_package_version || null,
    },
    // Back-compat for older UI
    overallHealth:
      overallLight === 'green' ? 'healthy' : overallLight === 'yellow' ? 'degraded' : 'critical',
    apps,
    infra,
    kpis: {
      activeUsersApprox: todayVisitors,
      todaysRequests: todayHits[0]?.count || statsDay.total,
      sampledRequests: statsDay.total,
      successRate: apiSummary.successRate,
      errorRate: apiSummary.errorRate,
      avgResponseMs: apiSummary.avgMs,
      openErrors: openErrorCount,
      warningCount: alertWarning || capacity.alertsSummary?.warning || 0,
      criticalAlertCount: openCritical,
    },
  };
}
