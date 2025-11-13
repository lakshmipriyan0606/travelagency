import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    packageType: { type: String, required: true },
    days: { type: String, required: true },
    rating: { type: Number, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    offerPrice: { type: Number, required: true },
    isBestPackage: { type: Boolean, required: true },
    bestRank: { type: Number, required: true },
    images: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);
