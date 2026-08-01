import mongoose from 'mongoose';

const devopsRequestLogSchema = new mongoose.Schema(
  {
    ts: { type: Date, default: Date.now, index: true },
    requestId: { type: String, default: '', index: true },
    method: { type: String, required: true },
    route: { type: String, required: true, index: true },
    routePattern: { type: String, default: '' },
    app: {
      type: String,
      enum: ['b2c', 'b2b', 'admin', 'system', 'devops'],
      default: 'system',
      index: true,
    },
    status: { type: Number, required: true, index: true },
    durationMs: { type: Number, default: 0 },
    bytesIn: { type: Number, default: 0 },
    bytesOut: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ipHash: { type: String, default: '' },
    uaFamily: { type: String, default: '' },
    success: { type: Boolean, default: true },
    errorCode: { type: String, default: null },
  },
  { timestamps: false, collection: 'devops_request_logs' }
);

devopsRequestLogSchema.index({ ts: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

export default mongoose.model('DevopsRequestLog', devopsRequestLogSchema);
