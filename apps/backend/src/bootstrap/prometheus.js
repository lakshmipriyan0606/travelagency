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
import { writeRequestLogSample } from '#devops/writers/requestLogWriter.js';

export const prometheusMiddleware = (req, res, next) => {
  httpRequestsActive.inc({ method: req.method });
  const end = httpRequestDuration.startTimer();
  const started = process.hrtime.bigint();

  res.on('finish', () => {
    httpRequestsActive.dec({ method: req.method });
    const fullPath = getFullPath(req);
    const route = fullPath || req.route?.path || req.path || 'unknown';
    const labels = { method: req.method, route, status: res.statusCode };

    httpRequestCounter.inc(labels);
    end(labels);

    const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
    writeRequestLogSample(req, res, durationMs);

    // Skip CORS preflight — it inflates route charts without signal.
    if (isPublicApiRequest(req) && req.method !== 'OPTIONS') {
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
