import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'vendor_sourcing',
        'quotation_preparation',
        'quotation_ready',
        'revision_requested',
        'quotation_updated',
        'accepted',
      ],
      required: true,
    },
    label: { type: String, required: true },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String, required: true },
  },
  { _id: false }
);

/** Draft rows may omit travel fields until later wizard steps. */
const requiredUnlessDraft = function requiredUnlessDraft() {
  return this.status !== 'draft';
};

const quoteRequestSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    contactPerson: {
      // Nested `this` is the subdoc — keep optional; final submit validates via Zod/API.
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      designation: { type: String },
    },
    destination: { type: String, required: requiredUnlessDraft },
    travelStart: { type: Date, required: requiredUnlessDraft, index: true },
    travelEnd: { type: Date, required: requiredUnlessDraft, index: true },
    adults: { type: Number, required: requiredUnlessDraft, default: 1 },
    children: { type: Number, default: 0 },
    rooms: { type: Number, default: 1 },
    budgetCategory: {
      type: String,
      enum: ['economy', 'standard', 'premium', 'luxury'],
      required: requiredUnlessDraft,
      default: 'standard',
    },
    preferredHotels: { type: String },
    transfers: {
      type: String,
      enum: ['none', 'shared', 'private', 'luxury'],
      default: 'none',
    },
    meals: {
      type: String,
      enum: ['none', 'breakfast', 'half_board', 'full_board', 'all_inclusive'],
      default: 'none',
    },
    guideRequired: { type: Boolean, default: false },
    specialRequirements: { type: String },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'vendor_sourcing',
        'quotation_preparation',
        'quotation_ready',
        'revision_requested',
        'quotation_updated',
        'accepted',
      ],
      default: 'draft',
      index: true,
    },
    assignedOperationsExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
    /** Ops-only notes — not shown to the agency portal. */
    internalNotes: { type: String },
    /** Admin feedback visible to the agency when changes are requested. */
    adminFeedback: { type: String },
    timeline: { type: [timelineEventSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AgencyUser', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AgencyUser' },
  },
  {
    timestamps: true,
  }
);

quoteRequestSchema.index({ createdAt: -1 });

export const QuoteRequest =
  mongoose.models.QuoteRequest || mongoose.model('QuoteRequest', quoteRequestSchema);

export default QuoteRequest;
