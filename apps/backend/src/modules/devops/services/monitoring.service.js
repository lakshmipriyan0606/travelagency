import DevopsRequestLog from '../models/devopsRequestLog.model.js';
import DevopsErrorEvent from '../models/devopsErrorEvent.model.js';
import ApiHit from '#b2c/analytics/apiHit.model.js';

function rangeDates(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Derive taxonomy / severity / Sentry link from stored error events (real fields only).
 */
export function enrichErrorEvent(doc) {
  if (!doc) return null;
  const msg = String(doc.message || '').toLowerCase();
  const status = Number(doc.sample?.statusCode) || null;
  const source = doc.source || 'unknown';

  let category = 'unknown';
  if (source === 'mongo') category = 'mongo';
  else if (
    source === 'auth' ||
    status === 401 ||
    /unauthoriz|unauthenticat|jwt|token expired|invalid token/.test(msg)
  )
    category = 'authn';
  else if (status === 403 || /forbidden|permission|not allowed|access denied/.test(msg))
    category = 'authz';
  else if (status === 400 || /validation|invalid|zod|cast to|bad request/.test(msg))
    category = 'validation';
  else if (status === 408 || /timeout|etimedout|timed out|aborterror/.test(msg))
    category = 'timeout';
  else if (/econnrefused|enotfound|fetch failed|axios|external/.test(msg)) category = 'external';
  else if (status != null && status >= 500) category = '5xx';
  else if (status != null && status >= 400) category = '4xx';
  else if (source === 'queue') category = 'queue';
  else if (source === 'api') category = '5xx';

  let severity = 'info';
  if (category === '5xx' || category === 'mongo' || (doc.count || 0) >= 50) {
    severity = 'critical';
  } else if (
    category === 'timeout' ||
    category === 'external' ||
    category === 'authn' ||
    (doc.count || 0) >= 10
  ) {
    severity = 'warning';
  }

  let sentryUrl = null;
  if (doc.sentryEventId) {
    const tpl = process.env.SENTRY_EVENT_URL_TEMPLATE;
    if (tpl) {
      sentryUrl = tpl.replaceAll('{id}', String(doc.sentryEventId));
    } else if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
      sentryUrl = `https://${process.env.SENTRY_ORG}.sentry.io/issues/?project=${process.env.SENTRY_PROJECT}&query=${encodeURIComponent(doc.sentryEventId)}`;
    }
  }

  return {
    ...doc,
    category,
    taxonomy: category,
    severity,
    occurrences: doc.count ?? 0,
    firstSeenAt: doc.firstSeenAt,
    lastSeenAt: doc.lastSeenAt,
    sentryEventId: doc.sentryEventId || null,
    sentryUrl,
    sentryLinkAvailable: Boolean(sentryUrl),
    sentryLinkReason: doc.sentryEventId
      ? sentryUrl
        ? null
        : 'sentryEventId present but SENTRY_ORG/SENTRY_PROJECT (or SENTRY_EVENT_URL_TEMPLATE) not set'
      : 'No sentryEventId on this fingerprint (Sentry capture may be disabled or not linked)',
  };
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

export async function listErrors({ status = 'open', limit = 50, severity, category }) {
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  const rows = await DevopsErrorEvent.find(filter)
    .sort({ lastSeenAt: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();

  let items = rows.map(enrichErrorEvent);
  if (severity && severity !== 'all') {
    items = items.filter((e) => e.severity === severity);
  }
  if (category && category !== 'all') {
    items = items.filter((e) => e.category === category);
  }
  return {
    items,
    filters: { status, severity: severity || 'all', category: category || 'all' },
    taxonomyNote:
      'category/severity are derived at read time from message, source, statusCode, and occurrence count',
  };
}

export async function getErrorDetail(fingerprint) {
  const doc = await DevopsErrorEvent.findOne({ fingerprint }).lean();
  return enrichErrorEvent(doc);
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
