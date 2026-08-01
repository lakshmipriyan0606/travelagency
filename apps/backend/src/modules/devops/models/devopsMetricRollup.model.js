import mongoose from 'mongoose';

/**
 * Aggregated API metrics from sampled devops_request_logs (+ optional ApiHit).
 * Buckets are keyed by time + method + routePattern (normalized route).
 */
const devopsMetricRollupSchema = new mongoose.Schema(
  {
    bucketStart: { type: Date, required: true, index: true },
    granularity: {
      type: String,
      enum: ['1m', '1h', '1d'],
      default: '1m',
      index: true,
    },
    method: { type: String, required: true },
    routePattern: { type: String, required: true, index: true },
    app: {
      type: String,
      enum: ['b2c', 'b2b', 'admin', 'system', 'devops', 'mixed'],
      default: 'system',
    },
    count: { type: Number, default: 0 },
    error4xx: { type: Number, default: 0 },
    error5xx: { type: Number, default: 0 },
    sumDurationMs: { type: Number, default: 0 },
    maxDurationMs: { type: Number, default: 0 },
    /** Approximate percentiles computed at rollup time from sample durations */
    p50Ms: { type: Number, default: null },
    p95Ms: { type: Number, default: null },
    p99Ms: { type: Number, default: null },
    bytesIn: { type: Number, default: 0 },
    bytesOut: { type: Number, default: 0 },
  },
  { timestamps: false, collection: 'devops_metric_rollups' }
);

devopsMetricRollupSchema.index(
  { bucketStart: 1, granularity: 1, method: 1, routePattern: 1 },
  { unique: true }
);
devopsMetricRollupSchema.index({ bucketStart: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

export default mongoose.model('DevopsMetricRollup', devopsMetricRollupSchema);
