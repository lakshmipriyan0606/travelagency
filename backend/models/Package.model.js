import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    packageType: { type: String, required: true },
    daysAndNights: { type: String, required: true },
    rating: { type: Number, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    offerPrice: { type: Number, required: true },
    isBestPackage: { type: Boolean},
    bestRank: { type: Number },
    images: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    days: [Object],
    likes: [
      {
        userId: { type: String, required: true },
        liked: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);
