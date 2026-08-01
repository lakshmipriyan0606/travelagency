import { logger } from '#shared/utils/logger.js';
import DevopsErrorEvent from '../models/devopsErrorEvent.model.js';
import { classifyApp, fingerprintError } from '../services/devopsCrypto.service.js';

export function writeErrorEvent(err, req) {
  try {
    const message = String(err?.message || 'Unknown error').slice(0, 500);
    const stack = String(err?.stack || '').slice(0, 4000);
    const route = req?.originalUrl?.split('?')[0] || '';
    const fingerprint = fingerprintError(message, stack, route);

    DevopsErrorEvent.findOneAndUpdate(
      { fingerprint },
      {
        $set: {
          message,
          stackTop: stack.split('\n').slice(0, 8).join('\n'),
          source: err?.name === 'MongoServerError' ? 'mongo' : 'api',
          app: classifyApp(route),
          lastSeenAt: new Date(),
          sample: {
            route,
            method: req?.method,
            statusCode: err?.statusCode || 500,
            requestId: req?.id || req?.headers?.['x-request-id'] || '',
          },
        },
        $inc: { count: 1 },
        $setOnInsert: { firstSeenAt: new Date(), status: 'open' },
      },
      { upsert: true }
    ).catch((e) => logger.warn({ err: e.message }, 'devops error event write failed'));
  } catch (e) {
    logger.warn({ err: e.message }, 'devops error event sample failed');
  }
}
