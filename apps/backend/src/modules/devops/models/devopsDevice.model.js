import mongoose from 'mongoose';

const devopsDeviceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fingerprintHash: { type: String, required: true },
    label: { type: String, default: 'Unknown device' },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    trusted: { type: Boolean, default: false },
    trustExpiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'devops_devices' }
);

devopsDeviceSchema.index({ userId: 1, fingerprintHash: 1 }, { unique: true });

export default mongoose.model('DevopsDevice', devopsDeviceSchema);
