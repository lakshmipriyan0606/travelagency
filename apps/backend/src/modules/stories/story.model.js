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
      default: 1,
    },
    orderNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

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

export const Story = mongoose.models.Story || mongoose.model("Story", storySchema);
export default Story;
