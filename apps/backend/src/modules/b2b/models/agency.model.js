import mongoose from 'mongoose';

const officeAddressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const agencySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    tradeName: { type: String },
    businessType: {
      type: String,
      enum: ['travel_agency', 'tour_operator', 'dmc', 'freelance_agent'],
      required: true,
    },
    registrationNumber: { type: String, required: true },
    country: { type: String, required: true },
    gstNumber: {
      type: String,
      required: [
        function () {
          return this.country === 'India';
        },
        'GST number is required for agencies based in India',
      ],
    },
    officeAddress: { type: officeAddressSchema, required: true },
    websiteUrl: { type: String },
    yearsInBusiness: { type: Number },
    iataNumber: { type: String },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    statusChangedAt: { type: Date },
    commissionRate: { type: Number, default: 0 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Agency = mongoose.models.Agency || mongoose.model('Agency', agencySchema);
export default Agency;
