import mongoose from 'mongoose';

/**
 * Custom package proposals — review vocabulary matches B2B quotes:
 * submitted (Pending) → under_review (Approved) | revision_requested (Needs Changes)
 * Legacy priced/saved kept in enum so existing docs still load.
 */
const cityStopSchema = new mongoose.Schema(
  {
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BCity', required: true },
    cityName: { type: String, required: true },
    nights: { type: Number, required: true, min: 1 },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BHotel', default: null },
    hotelName: { type: String, default: '' },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BPackage', default: null },
  },
  { _id: false }
);

/** Day-slot activity picked from a B2B package master (Add Activity flow). */
const activitySchema = new mongoose.Schema(
  {
    dayNum: { type: Number, required: true, min: 1 },
    slot: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BCity', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BPackage', required: true },
    packageName: { type: String, default: '' },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const customProposalSchema = new mongoose.Schema(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AgencyUser', required: true },
    reference: { type: String, required: true, unique: true },
    /** Human-readable label for drafts / My Proposals (auto from cities or client). */
    name: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: [
        'draft',
        'priced', // legacy
        'saved', // legacy
        'submitted',
        'under_review',
        'revision_requested',
      ],
      default: 'draft',
      index: true,
    },
    /** Admin feedback visible to the agency when changes are requested. */
    adminFeedback: { type: String, default: '' },
    destinations: { type: [cityStopSchema], default: [] },
    activities: { type: [activitySchema], default: [] },
    tripDetails: {
      leavingFromCityId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BCity', default: null },
      leavingFromName: { type: String, default: '' },
      nationalityCode: { type: String, default: '' },
      leavingOn: { type: Date, default: null },
      rooms: { type: Number, default: 1 },
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
      starRating: { type: Number, enum: [0, 3, 4, 5], default: 0 },
      includeTransfers: { type: Boolean, default: true },
    },
    pricing: {
      currency: { type: String, default: 'USD' },
      subtotal: { type: Number, default: 0 },
      transferTotal: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      breakdown: [{ label: String, amount: Number }],
    },
  },
  { timestamps: true }
);

customProposalSchema.index({ agencyId: 1, createdAt: -1 });
customProposalSchema.index({ status: 1, createdAt: -1 });

export const CustomProposal =
  mongoose.models.CustomProposal || mongoose.model('CustomProposal', customProposalSchema);
export default CustomProposal;
