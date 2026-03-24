import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    packageName: { type: String, required: true },
    packageDescription: { type: String, required: true },
    packageType: { type: String, required: true },
    daysAndNights: { type: String, required: true },
    hotelName: { type: String },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    country: { type: String, required: true },
    offerPrice: { type: Number, required: true },
    isBestPackage: { type: Boolean},
    bestRank: { type: Number },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    activityCategory: { type: String, default: null },
    images: [{
      url: { type: String, required: true },
      alt: { type: String, default: "" }
    }],
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    days: [{
      dayTitle: { type: String, default: "" },
      slots: [{
        slotType: { type: String, default: "" },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
        imageAlt: { type: String, default: "" }
      }]
    }],
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
