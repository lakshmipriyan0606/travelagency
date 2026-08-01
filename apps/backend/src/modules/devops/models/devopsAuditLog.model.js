import mongoose from 'mongoose';

const devopsAuditLogSchema = new mongoose.Schema(
  {
    ts: { type: Date, default: Date.now, index: true },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    module: { type: String, default: 'devops' },
    ip: { type: String, default: '' },
    deviceId: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    result: { type: String, enum: ['ok', 'denied', 'error'], default: 'ok' },
  },
  { timestamps: false, collection: 'devops_audit_logs' }
);

devopsAuditLogSchema.index({ ts: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export default mongoose.model('DevopsAuditLog', devopsAuditLogSchema);
