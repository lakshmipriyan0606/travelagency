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
