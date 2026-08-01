/**
 * API metric rollups — real samples only.
 * On-demand + throttled aggregation from devops_request_logs.
 */
import DevopsRequestLog from '../models/devopsRequestLog.model.js';
import DevopsMetricRollup from '../models/devopsMetricRollup.model.js';
import ApiHit from '#b2c/analytics/apiHit.model.js';
import { logger } from '#shared/utils/logger.js';

const ROLLUP_THROTTLE_MS = Number(process.env.DEVOPS_ROLLUP_THROTTLE_MS) || 60_000;
let lastRollupAt = 0;
let rollupInFlight = null;

function rangeDates(from, to, defaultMs = 24 * 60 * 60 * 1000) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(Date.now() - defaultMs);
  return { start, end };
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

function normalizeRoute(route, routePattern) {
  const raw = String(routePattern || route || '').split('?')[0] || '/';
  // Collapse ObjectId-like and numeric path segments
  return raw
    .replace(/\/[a-f0-9]{24}(?=\/|$)/gi, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .slice(0, 200);
}

function floorToMinute(d) {
  const t = new Date(d);
  t.setUTCSeconds(0, 0);
  return t;
}

/**
 * Aggregate recent request logs into 1m rollup docs (throttled).
 */
export async function runMetricRollup({ force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastRollupAt < ROLLUP_THROTTLE_MS) {
    return { skipped: true, reason: 'throttled', lastRollupAt };
  }
  if (rollupInFlight) return rollupInFlight;

  rollupInFlight = (async () => {
    try {
      const lookbackMs = 2 * 60 * 60 * 1000; // last 2h window refresh
      const start = new Date(Date.now() - lookbackMs);
      const rows = await DevopsRequestLog.find({ ts: { $gte: start } })
        .select('ts method route routePattern app status durationMs bytesIn bytesOut')
        .lean()
        .limit(50_000);

      /** @type {Map<string, any>} */
      const buckets = new Map();

      for (const r of rows) {
        const bucketStart = floorToMinute(r.ts);
        const routePattern = normalizeRoute(r.route, r.routePattern);
        const method = String(r.method || 'GET').toUpperCase();
        const key = `${bucketStart.toISOString()}|${method}|${routePattern}`;
        let b = buckets.get(key);
        if (!b) {
          b = {
            bucketStart,
            granularity: '1m',
            method,
            routePattern,
            app: r.app || 'system',
            count: 0,
            error4xx: 0,
            error5xx: 0,
            sumDurationMs: 0,
            maxDurationMs: 0,
            bytesIn: 0,
            bytesOut: 0,
            durations: [],
          };
          buckets.set(key, b);
        }
        b.count += 1;
        const ms = Number(r.durationMs) || 0;
        b.sumDurationMs += ms;
        if (ms > b.maxDurationMs) b.maxDurationMs = ms;
        b.bytesIn += Number(r.bytesIn) || 0;
        b.bytesOut += Number(r.bytesOut) || 0;
        const st = Number(r.status) || 0;
        if (st >= 500) b.error5xx += 1;
        else if (st >= 400) b.error4xx += 1;
        if (b.durations.length < 500) b.durations.push(ms);
        if (b.app !== r.app && r.app) b.app = 'mixed';
      }

      const ops = [];
      for (const b of buckets.values()) {
        const sorted = b.durations.slice().sort((a, c) => a - c);
        ops.push({
          updateOne: {
            filter: {
              bucketStart: b.bucketStart,
              granularity: '1m',
              method: b.method,
              routePattern: b.routePattern,
            },
            update: {
              $set: {
                app: b.app,
                count: b.count,
                error4xx: b.error4xx,
                error5xx: b.error5xx,
                sumDurationMs: b.sumDurationMs,
                maxDurationMs: b.maxDurationMs,
                p50Ms: percentile(sorted, 50),
                p95Ms: percentile(sorted, 95),
                p99Ms: percentile(sorted, 99),
                bytesIn: b.bytesIn,
                bytesOut: b.bytesOut,
              },
            },
            upsert: true,
          },
        });
      }

      if (ops.length) {
        await DevopsMetricRollup.bulkWrite(ops, { ordered: false });
      }

      lastRollupAt = Date.now();
      return {
        skipped: false,
        buckets: ops.length,
        samples: rows.length,
        lastRollupAt,
      };
    } catch (err) {
      logger.warn({ err: err.message }, 'devops metric rollup failed');
      return { skipped: false, error: err.message, buckets: 0 };
    } finally {
      rollupInFlight = null;
    }
  })();

  return rollupInFlight;
}

export async function getObservabilitySummary({ from, to } = {}) {
  const rollupMeta = await runMetricRollup();
  const { start, end } = rangeDates(from, to);

  const [agg, series, failed, slow, topUsed] = await Promise.all([
    DevopsMetricRollup.aggregate([
      {
        $match: {
          granularity: '1m',
          bucketStart: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          requests: { $sum: '$count' },
          error4xx: { $sum: '$error4xx' },
          error5xx: { $sum: '$error5xx' },
          sumMs: { $sum: '$sumDurationMs' },
          maxMs: { $max: '$maxDurationMs' },
          buckets: { $sum: 1 },
        },
      },
    ]),
    DevopsMetricRollup.aggregate([
      {
        $match: {
          granularity: '1m',
          bucketStart: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$bucketStart',
          requests: { $sum: '$count' },
          errors: { $sum: { $add: ['$error4xx', '$error5xx'] } },
          sumMs: { $sum: '$sumDurationMs' },
          p95Max: { $max: '$p95Ms' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 500 },
    ]),
    DevopsMetricRollup.aggregate([
      {
        $match: {
          granularity: '1m',
          bucketStart: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { method: '$method', route: '$routePattern' },
          count: { $sum: '$count' },
          errors: { $sum: { $add: ['$error4xx', '$error5xx'] } },
          error5xx: { $sum: '$error5xx' },
          avgMs: {
            $avg: { $cond: [{ $gt: ['$count', 0] }, { $divide: ['$sumDurationMs', '$count'] }, 0] },
          },
        },
      },
      { $match: { errors: { $gt: 0 } } },
      { $sort: { error5xx: -1, errors: -1 } },
      { $limit: 20 },
    ]),
    DevopsMetricRollup.aggregate([
      {
        $match: {
          granularity: '1m',
          bucketStart: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { method: '$method', route: '$routePattern' },
          count: { $sum: '$count' },
          avgMs: {
            $avg: {
              $cond: [{ $gt: ['$count', 0] }, { $divide: ['$sumDurationMs', '$count'] }, 0],
            },
          },
          p95Ms: { $max: '$p95Ms' },
          p99Ms: { $max: '$p99Ms' },
          maxMs: { $max: '$maxDurationMs' },
        },
      },
      { $sort: { p95Ms: -1, avgMs: -1 } },
      { $limit: 20 },
    ]),
    ApiHit.aggregate([
      {
        $group: {
          _id: { method: '$method', route: '$route' },
          count: { $sum: '$count' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]).catch(() => []),
  ]);

  const totals = agg[0] || {
    requests: 0,
    error4xx: 0,
    error5xx: 0,
    sumMs: 0,
    maxMs: 0,
    buckets: 0,
  };
  const windowSec = Math.max(1, (end - start) / 1000);
  const avgMs = totals.requests > 0 ? Math.round(totals.sumMs / totals.requests) : null;
  const errorRate =
    totals.requests > 0
      ? Number((((totals.error4xx + totals.error5xx) / totals.requests) * 100).toFixed(2))
      : null;

  const available = totals.buckets > 0 || totals.requests > 0;

  return {
    available,
    reason: available
      ? null
      : 'No metric rollups yet — traffic samples accumulate in devops_request_logs; rollup runs on demand (throttled).',
    range: { from: start.toISOString(), to: end.toISOString() },
    rollup: rollupMeta,
    sampledNote:
      'KPIs derive from sampled request logs rolled into devops_metric_rollups; ApiHit is public-route totals only.',
    kpis: {
      requests: totals.requests,
      rps: Number((totals.requests / windowSec).toFixed(3)),
      rpm: Number((totals.requests / (windowSec / 60)).toFixed(2)),
      avgMs,
      maxMs: totals.maxMs || null,
      error4xx: totals.error4xx,
      error5xx: totals.error5xx,
      errorRatePct: errorRate,
    },
    series: series.map((s) => ({
      minute: s._id,
      requests: s.requests,
      errors: s.errors,
      avgMs: s.requests ? Math.round(s.sumMs / s.requests) : 0,
      p95Ms: s.p95Max,
    })),
    topSlow: slow.map((r) => ({
      method: r._id.method,
      route: r._id.route,
      count: r.count,
      avgMs: Math.round(r.avgMs || 0),
      p95Ms: r.p95Ms != null ? Math.round(r.p95Ms) : null,
      p99Ms: r.p99Ms != null ? Math.round(r.p99Ms) : null,
      maxMs: r.maxMs,
    })),
    topFailed: failed.map((r) => ({
      method: r._id.method,
      route: r._id.route,
      count: r.count,
      errors: r.errors,
      error5xx: r.error5xx,
      avgMs: Math.round(r.avgMs || 0),
    })),
    topUsed: topUsed.map((r) => ({
      method: r._id.method,
      route: r._id.route,
      count: r.count,
      source: 'apihit',
    })),
  };
}
