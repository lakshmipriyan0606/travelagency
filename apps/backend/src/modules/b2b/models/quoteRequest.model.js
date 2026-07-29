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

const quoteRequestSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    contactPerson: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      designation: { type: String },
    },
    destination: { type: String, required: true },
    travelStart: { type: Date, required: true, index: true },
    travelEnd: { type: Date, required: true, index: true },
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    rooms: { type: Number, default: 1 },
    budgetCategory: {
      type: String,
      enum: ['economy', 'standard', 'premium', 'luxury'],
      required: true,
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
    internalNotes: { type: String },
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
