import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Destination title is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Navigation location/city is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    alt: {
      type: String,
      default: "Popular Destination",
    },
    orderNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Destination = mongoose.models.Destination || mongoose.model("Destination", destinationSchema);
export default Destination;
