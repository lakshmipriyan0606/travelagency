import { logger } from '#shared/utils/logger.js';
import DevopsRequestLog from '../models/devopsRequestLog.model.js';
import {
  classifyApp,
  clientIp,
  hashIp,
  shouldSampleRequest,
} from '../services/devopsCrypto.service.js';

function uaFamily(ua = '') {
  if (/Edg/i.test(ua)) return 'Edge';
  if (/Chrome/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua)) return 'Safari';
  return 'Other';
}

/**
 * Fire-and-forget request sampler. Never await on the hot path.
 */
export function writeRequestLogSample(req, res, durationMs) {
  try {
    if (req.method === 'OPTIONS') return;
    const route = req.originalUrl?.split('?')[0] || req.path || 'unknown';
    if (route.startsWith('/metrics') || route.startsWith('/health')) return;

    const status = res.statusCode || 0;
    if (!shouldSampleRequest(status, durationMs)) return;

    const doc = {
      ts: new Date(),
      requestId: req.id || req.headers['x-request-id'] || '',
      method: req.method,
      route,
      routePattern: req.route?.path || '',
      app: classifyApp(route),
      status,
      durationMs: Math.round(durationMs),
      bytesIn: Number(req.headers['content-length'] || 0),
      bytesOut: Number(res.getHeader?.('content-length') || 0),
      userId: req.user?._id || null,
      ipHash: hashIp(clientIp(req)),
      uaFamily: uaFamily(req.headers['user-agent']),
      success: status < 400,
      errorCode: status >= 400 ? String(status) : null,
    };

    DevopsRequestLog.create(doc).catch((err) =>
      logger.warn({ err: err.message }, 'devops request log write failed')
    );
  } catch (err) {
    logger.warn({ err: err.message }, 'devops request log sample failed');
  }
}
