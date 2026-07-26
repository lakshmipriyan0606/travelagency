import mongoose from 'mongoose';

const agencyStatusLogSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
    },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
    },
    reason: { type: String },
  },
  { timestamps: true }
);

export const AgencyStatusLog =
  mongoose.models.AgencyStatusLog || mongoose.model('AgencyStatusLog', agencyStatusLogSchema);
export default AgencyStatusLog;
