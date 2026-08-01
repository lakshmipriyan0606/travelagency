import DevopsRequestLog from '../models/devopsRequestLog.model.js';
import DevopsErrorEvent from '../models/devopsErrorEvent.model.js';
import ApiHit from '#b2c/analytics/apiHit.model.js';

function rangeDates(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function listRequestLogs({ from, to, app, status, q, limit = 50, cursor }) {
  const { start, end } = rangeDates(from, to);
  const filter = { ts: { $gte: start, $lte: end } };
  if (app) filter.app = app;
  if (status) filter.status = Number(status);
  if (q) filter.route = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (cursor) filter.ts = { ...filter.ts, $lt: new Date(cursor) };

  const rows = await DevopsRequestLog.find(filter)
    .sort({ ts: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();

  return {
    items: rows,
    nextCursor: rows.length ? rows[rows.length - 1].ts.toISOString() : null,
  };
}

export async function getApiPerformance({ from, to }) {
  const { start, end } = rangeDates(from, to);
  const [slow, top, series] = await Promise.all([
    DevopsRequestLog.aggregate([
      { $match: { ts: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { method: '$method', route: '$route' },
          avgMs: { $avg: '$durationMs' },
          maxMs: { $max: '$durationMs' },
          count: { $sum: 1 },
          errors: { $sum: { $cond: [{ $gte: ['$status', 400] }, 1, 0] } },
        },
      },
      { $sort: { avgMs: -1 } },
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
    ]),
    DevopsRequestLog.aggregate([
      { $match: { ts: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%dT%H:00:00', date: '$ts' },
          },
          requests: { $sum: 1 },
          errors: { $sum: { $cond: [{ $gte: ['$status', 400] }, 1, 0] } },
          avgMs: { $avg: '$durationMs' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    slowApis: slow.map((r) => ({
      method: r._id.method,
      route: r._id.route,
      avgMs: Math.round(r.avgMs || 0),
      maxMs: r.maxMs,
      count: r.count,
      errors: r.errors,
    })),
    topApis: top.map((r) => ({
      method: r._id.method,
      route: r._id.route,
      count: r.count,
    })),
    series: series.map((r) => ({
      hour: r._id,
      requests: r.requests,
      errors: r.errors,
      avgMs: Math.round(r.avgMs || 0),
    })),
  };
}

export async function listErrors({ status = 'open', limit = 50 }) {
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  return DevopsErrorEvent.find(filter)
    .sort({ lastSeenAt: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();
}

export async function getErrorDetail(fingerprint) {
  return DevopsErrorEvent.findOne({ fingerprint }).lean();
}

export async function updateErrorStatus(fingerprint, status) {
  return DevopsErrorEvent.findOneAndUpdate(
    { fingerprint },
    { $set: { status } },
    { new: true }
  ).lean();
}

export async function searchLogs({ q, from, to, limit = 50 }) {
  const { start, end } = rangeDates(from, to);
  const rx = q ? { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } : null;

  const [requests, errors] = await Promise.all([
    DevopsRequestLog.find({
      ts: { $gte: start, $lte: end },
      ...(rx ? { route: rx } : {}),
    })
      .sort({ ts: -1 })
      .limit(Number(limit))
      .lean(),
    DevopsErrorEvent.find({
      lastSeenAt: { $gte: start, $lte: end },
      ...(rx ? { message: rx } : {}),
    })
      .sort({ lastSeenAt: -1 })
      .limit(Number(limit))
      .lean(),
  ]);

  return { requests, errors };
}
