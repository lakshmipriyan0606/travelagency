import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: null },
  name: { type: String, required: true },
  city: { type: String, default: '' },
  destination: { type: String, required: true },
  packageName: { type: String, default: '' },
  vacationType: { type: String, default: '' },
  duration: { type: String, default: '' },
  language: { type: String, default: '' },
  travelDate: { type: Date, default: null },
  travelMonth: { type: String, default: '' },
  noOfPeople: { type: String, default: '' },
  message: { type: String, default: '', maxLength: 500 },
  createdAt: { type: Date, default: Date.now },
  sheetSyncStatus: { type: String, default: 'Pending' },
  userEmailStatus: { type: String, default: 'Pending' },
  adminEmailStatus: { type: String, default: 'Pending' },
  errorLogs: [
    {
      task: { type: String },
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ sheetSyncStatus: 1, createdAt: -1 });
BookingSchema.index({ email: 1 });
BookingSchema.index({ destination: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export default Booking;
