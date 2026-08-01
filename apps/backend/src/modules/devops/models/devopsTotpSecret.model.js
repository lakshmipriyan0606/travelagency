import mongoose from 'mongoose';

const devopsTotpSecretSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    secretEnc: { type: String, required: true },
    backupCodesHash: [{ type: String }],
    enabledAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'devops_totp_secrets' }
);

export default mongoose.model('DevopsTotpSecret', devopsTotpSecretSchema);
