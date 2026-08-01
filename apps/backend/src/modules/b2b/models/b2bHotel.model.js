import mongoose from 'mongoose';

const b2bHotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'B2BCity', required: true },
    starRating: { type: Number, enum: [3, 4, 5], default: 3 },
    /** Nightly base amount used when pricing custom packages */
    baseNightlyRate: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD', trim: true },
    notes: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

b2bHotelSchema.index({ cityId: 1, isActive: 1 });
b2bHotelSchema.index({ name: 1 });

export const B2BHotel = mongoose.models.B2BHotel || mongoose.model('B2BHotel', b2bHotelSchema);
export default B2BHotel;
