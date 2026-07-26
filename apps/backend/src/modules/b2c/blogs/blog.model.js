/**
 * ============================================================================
 * Blog Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for blog posts. Handles dynamic read time
 * calculation, soft deletes, and stores nested FAQs and likes.
 *
 * Called By:
 * src/modules/blogs/blog.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    thumbnailImage: {
      url: { type: String, required: true },
      alt: { type: String, default: '' },
    },
    author: { type: String, required: true },
    miniDescription: { type: String, required: true },
    content: { type: String, required: true },
    bannerImage: {
      url: { type: String, required: true },
      alt: { type: String, default: '' },
    },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
    readTime: { type: String, default: '3 Mins read' },

    // Tracks unique user likes
    likes: [
      {
        userId: { type: String, required: true },
        liked: { type: Boolean, required: true },
      },
    ],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

/**
 * Pre-save Hook
 * Automatically calculates the estimated reading time based on
 * an average reading speed of 200 words per minute.
 */
blogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    this.readTime = `${minutes} Min${minutes !== 1 ? 's' : ''} read`;
  }
  next();
});

export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
export default Blog;
