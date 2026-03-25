import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    thumbnailImage: {
      url: { type: String, required: true },
      alt: { type: String, default: "" },
    },
    author: { type: String, required: true },
    miniDescription: { type: String, required: true },
    content: { type: String, required: true },
    bannerImage: {
      url: { type: String, required: true },
      alt: { type: String, default: "" },
    },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
    readTime: { type: String, default: "3 Mins read" },
    likes: [
      {
        userId: { type: String, required: true },
        liked: { type: Boolean, required: true },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate readTime roughly based on content length
blogSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordCount = this.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200); // 200 words per minute average
    this.readTime = `${minutes} Min${minutes !== 1 ? 's' : ''} read`;
  }
  next();
});

export default mongoose.model("Blog", blogSchema);
