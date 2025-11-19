import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  
  // Encrypted fields (stored as string)
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, default: null },

  // Normal fields
  name: { type: String, required: true },
  city: { type: String, required: true },
  destination: { type: String, required: true },
  vacationType: { type: String, default: "" },

  // Correct types
  travelDate: { type: Date, required: true },
  noOfPeople: { type: Number, required: true },

  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;
