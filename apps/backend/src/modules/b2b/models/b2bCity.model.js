import mongoose from 'mongoose';

const b2bCitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    countryCode: { type: String, required: true, trim: true, uppercase: true },
    region: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

b2bCitySchema.index({ name: 1, countryCode: 1 });
b2bCitySchema.index({ isActive: 1 });

export const B2BCity = mongoose.models.B2BCity || mongoose.model('B2BCity', b2bCitySchema);
export default B2BCity;
