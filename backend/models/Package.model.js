import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: String,
    description: String,
    price: Number,
    duration: String,
    images: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);
