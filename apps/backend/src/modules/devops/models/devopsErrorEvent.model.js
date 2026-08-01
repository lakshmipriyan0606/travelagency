import mongoose from 'mongoose';

const devopsErrorEventSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, required: true, unique: true, index: true },
    message: { type: String, required: true },
    stackTop: { type: String, default: '' },
    source: {
      type: String,
      enum: ['api', 'js', 'mongo', 'auth', 'queue', 'unknown'],
      default: 'api',
    },
    app: {
      type: String,
      enum: ['b2c', 'b2b', 'admin', 'system', 'devops'],
      default: 'system',
    },
    count: { type: Number, default: 1 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now, index: true },
    sample: { type: mongoose.Schema.Types.Mixed, default: {} },
    sentryEventId: { type: String, default: null },
    status: {
      type: String,
      enum: ['open', 'ack', 'resolved'],
      default: 'open',
      index: true,
    },
  },
  { timestamps: true, collection: 'devops_error_events' }
);

devopsErrorEventSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('DevopsErrorEvent', devopsErrorEventSchema);
