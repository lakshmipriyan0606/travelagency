import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    city: {
      type: String,
      required: true,
      default: "Chennai",
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    whatsapp: {
      type: String,
      default: null,
    },

    destination: {
      type: String,
      required: true,
      default: "Bali",
    },

    travelDate: {
      type: Date,
      required: true,
    },

    noOfPeople: {
      type: Number,
      required: true,
    },

    vacationType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;
