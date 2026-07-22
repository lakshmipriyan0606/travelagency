import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['package', 'activity'], default: 'package', index: true },
    packageName: { type: String, required: true },
    packageDescription: { type: String, required: true },
    packageType: { type: String, default: '' },
    daysAndNights: { type: String, default: '' },
    hotelName: { type: String },
    price: { type: Number, default: 0 },
    location: { type: String, required: true },
    country: { type: String, required: true },
    offerPrice: { type: Number, default: 0 },
    isBestPackage: { type: Boolean },
    bestRank: { type: Number },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    activityCategory: { type: String, default: null },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: { type: String, default: '' },
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    days: [
      {
        dayTitle: { type: String, default: '' },
        slots: [
          {
            slotType: { type: String, default: '' },
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            imageUrl: { type: String, default: '' },
            imageAlt: { type: String, default: '' },
          },
        ],
      },
    ],
    languages: { type: String, default: '' },
    likes: [
      {
        userId: { type: String, required: true },
        liked: { type: Boolean, required: true },
      },
    ],
    operatingHours: { type: String, default: '' },
    isInstantConfirmation: { type: Boolean, default: false },
    isNonRefundable: { type: Boolean, default: false },
    highlights: [{ type: String, default: '' }],
  },
  { timestamps: true }
);
packageSchema.index({ location: 1, country: 1, isActive: 1 });
packageSchema.index({ type: 1, status: 1 });
packageSchema.index({ packageName: 'text', packageDescription: 'text' });

export const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);
export default Package;
