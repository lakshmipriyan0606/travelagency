/**
 * ============================================================================
 * Prometheus Middleware
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Monitoring
 *
 * Responsibility:
 * Intercepts every HTTP request to measure active connections, request duration,
 * and total request counts for Prometheus scraping.
 * Simultaneously updates the MongoDB analytics collection for dashboard views
 * if the request is deemed "public".
 *
 * Called By:
 * src/app/registerMiddlewares.js
 * ============================================================================
 */
import {
  httpRequestCounter,
  publicHttpRequestCounter,
  httpRequestDuration,
  httpRequestsActive,
} from '#config/metrics.js';
import ApiHit from '#b2c/analytics/apiHit.model.js';
import { getFullPath, getUtcDateString, isPublicApiRequest } from '#shared/utils/requestOrigin.js';
import { logger } from '#shared/utils/logger.js';

export const prometheusMiddleware = (req, res, next) => {
  httpRequestsActive.inc({ method: req.method });
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    httpRequestsActive.dec({ method: req.method });
    const fullPath = getFullPath(req);
    const route = fullPath || req.route?.path || req.path || 'unknown';
    const labels = { method: req.method, route, status: res.statusCode };

    httpRequestCounter.inc(labels);
    end(labels);

    if (isPublicApiRequest(req)) {
      publicHttpRequestCounter.inc(labels);

      const date = getUtcDateString();
      ApiHit.findOneAndUpdate(
        { date, method: req.method, route, status: res.statusCode },
        { $inc: { count: 1 } },
        { upsert: true }
      ).catch((err) => logger.error(`ApiHit persist error: ${err.message}`));
    }
  });

  next();
};
