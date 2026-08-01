import DevopsAuditLog from '../models/devopsAuditLog.model.js';
import { logger } from '#shared/utils/logger.js';

export async function writeAudit({
  actorUserId,
  action,
  module = 'devops',
  ip = '',
  deviceId = '',
  meta = {},
  result = 'ok',
}) {
  try {
    await DevopsAuditLog.create({
      ts: new Date(),
      actorUserId,
      action,
      module,
      ip,
      deviceId,
      meta,
      result,
    });
  } catch (err) {
    logger.warn({ err: err.message }, 'devops audit write failed');
  }
}

export async function listAuditLogs({ from, to, action, result, limit = 100, cursor } = {}) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const filter = { ts: { $gte: start, $lte: end } };
  if (action) {
    filter.action = {
      $regex: String(action).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }
  if (result && result !== 'all') filter.result = result;
  if (cursor) filter.ts = { ...filter.ts, $lt: new Date(cursor) };

  const rows = await DevopsAuditLog.find(filter)
    .sort({ ts: -1 })
    .limit(Math.min(Number(limit) || 100, 500))
    .lean();

  return {
    available: true,
    range: { from: start.toISOString(), to: end.toISOString() },
    items: rows.map((r) => ({
      ts: r.ts,
      action: r.action,
      module: r.module,
      result: r.result,
      actorUserId: r.actorUserId || null,
      ip: r.ip ? `${String(r.ip).slice(0, 8)}…` : '',
      deviceId: r.deviceId ? String(r.deviceId).slice(0, 12) : '',
      meta: r.meta || {},
    })),
    nextCursor: rows.length ? rows[rows.length - 1].ts.toISOString() : null,
  };
}
