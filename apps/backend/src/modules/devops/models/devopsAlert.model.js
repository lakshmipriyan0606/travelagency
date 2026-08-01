import mongoose from 'mongoose';

const devopsAlertSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, required: true, unique: true, index: true },
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      default: 'warning',
      index: true,
    },
    source: {
      type: String,
      enum: ['capacity', 'error', 'security', 'queue', 'api', 'system'],
      default: 'system',
      index: true,
    },
    title: { type: String, required: true },
    cause: { type: String, default: '' },
    impact: { type: String, default: '' },
    action: { type: String, default: '' },
    eta: { type: String, default: null },
    status: {
      type: String,
      enum: ['open', 'ack', 'resolved'],
      default: 'open',
      index: true,
    },
    resource: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now, index: true },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'devops_alerts' }
);

devopsAlertSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('DevopsAlert', devopsAlertSchema);
