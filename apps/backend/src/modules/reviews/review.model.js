import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    profileImage: {
      url: { type: String, required: true },
      alt: { type: String, default: "" },
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    orderNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.pre("save", async function (next) {
  if (this.isNew && (this.orderNumber === undefined || this.orderNumber === null)) {
    try {
      const lastReview = await mongoose.model("Review").findOne().sort("-orderNumber");
      this.orderNumber = lastReview ? lastReview.orderNumber + 1 : 1;
    } catch (error) {
      console.error("Error setting orderNumber:", error);
    }
  }
  next();
});

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
