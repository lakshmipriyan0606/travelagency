import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  
  // Encrypted fields (stored as string)
  email: { type: String, required: true },
  phone: { type: String, default: "" }, // Made optional
  whatsapp: { type: String, default: null },

  // Normal fields
  name: { type: String, required: true },
  city: { type: String, default: "" }, // Made optional
  destination: { type: String, required: true },
  vacationType: { type: String, default: "" },
  duration: { type: String, default: "" }, // Added
  language: { type: String, default: "" }, // Added

  // Correct types
  travelDate: { type: Date, default: null }, // Made optional
  travelMonth: { type: String, default: "" }, // Added
  noOfPeople: { type: String, default: "" }, // Changed to String to accommodate e.g. "8 Persons"

  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;
