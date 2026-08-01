import mongoose from 'mongoose';

/**
 * B2B sellable package template tied to a city (not B2C catalog packages).
 * Amounts feed Create Custom Package pricing. Global master — shared by all agencies.
 */
const b2bPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BCity', required: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BHotel', default: null },
    nights: { type: Number, default: 1, min: 1 },
    description: { type: String, trim: true, default: '' },
    /** Line amounts for dynamic pricing */
    amounts: {
      basePrice: { type: Number, default: 0, min: 0 },
      perNight: { type: Number, default: 0, min: 0 },
      transferAddon: { type: Number, default: 0, min: 0 },
      activityAddon: { type: Number, default: 0, min: 0 },
    },
    currency: { type: String, default: 'USD', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

b2bPackageSchema.index({ cityId: 1, isActive: 1 });

export const B2BPackage =
  mongoose.models.B2BPackage || mongoose.model('B2BPackage', b2bPackageSchema);
export default B2BPackage;
