import { logger } from '../shared/logger.js';
import * as Sentry from '@sentry/node';
import client from 'prom-client';
import { register } from '../../config/metrics.js';

export const dbQueryDuration = new client.Histogram({
  name: 'travelagency_db_query_duration_seconds',
  help: 'Duration of MongoDB queries in seconds',
  labelNames: ['operation', 'model'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

const SLOW_QUERY_THRESHOLD_MS = 100;

export default function mongooseProfiler(schema) {
  const operations = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'aggregate',
    'countDocuments',
    'save',
  ];

  for (const op of operations) {
    schema.pre(op, function (next) {
      this._startTime = Date.now();
      next();
    });

    schema.post(op, function (res, next) {
      if (this._startTime) {
        const durationMs = Date.now() - this._startTime;
        const modelName = this.model?.modelName || this.constructor?.modelName || 'unknown';

        dbQueryDuration.observe({ operation: op, model: modelName }, durationMs / 1000);

        if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
          const warnMsg = `Slow Query Detected [${durationMs}ms]: ${modelName}.${op}`;
          logger.warn({ model: modelName, operation: op, durationMs }, warnMsg);

          if (process.env.SENTRY_DSN) {
            Sentry.addBreadcrumb({
              category: 'db.query',
              message: warnMsg,
              level: 'warning',
              data: { model: modelName, operation: op, durationMs },
            });
          }
        }
      }
      next();
    });
  }
}
