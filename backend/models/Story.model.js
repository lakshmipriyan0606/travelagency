import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "Customer Story",
    },
    row: {
      type: Number,
      enum: [1, 2],
      default: 1, // Lane 1 or Lane 2 in the marquee
    },
    orderNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-increment orderNumber within the same row if not specified
storySchema.pre("save", async function (next) {
  if (this.isNew && (this.orderNumber === undefined || this.orderNumber === null || this.orderNumber === 0)) {
    try {
      const lastStory = await mongoose.model("Story").findOne({ row: this.row }).sort("-orderNumber");
      this.orderNumber = lastStory ? lastStory.orderNumber + 1 : 1;
    } catch (error) {
      console.error("Error setting orderNumber for story:", error);
    }
  }
  next();
});

export default mongoose.model("Story", storySchema);
