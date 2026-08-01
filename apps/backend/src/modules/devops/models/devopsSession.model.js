import mongoose from 'mongoose';

const devopsSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    deviceId: { type: String, required: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '', maxlength: 400 },
    csrfSecret: { type: String, required: true },
    otpVerifiedAt: { type: Date },
    totpVerifiedAt: { type: Date },
    deviceVerifiedAt: { type: Date },
    lastSeenAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'devops_sessions' }
);

devopsSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('DevopsSession', devopsSessionSchema);
