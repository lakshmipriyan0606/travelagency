/**
 * ============================================================================
 * Review Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for Customer Reviews shown on the website.
 * Supports manual ordering and draft/publish workflows.
 *
 * Called By:
 * src/modules/reviews/review.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

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
      alt: { type: String, default: '' },
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

    // Visibility toggle (Draft reviews are hidden from public API)
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },

    // Controls the display order in the UI carousel
    orderNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Pre-save Hook
 * Automatically appends new reviews to the end of the ordering list
 * if no specific order number was provided.
 */
reviewSchema.pre('save', async function (next) {
  if (this.isNew && (this.orderNumber === undefined || this.orderNumber === null)) {
    try {
      const lastReview = await mongoose.model('Review').findOne().sort('-orderNumber');
      this.orderNumber = lastReview ? lastReview.orderNumber + 1 : 1;
    } catch (error) {
      console.error('Error setting orderNumber:', error);
    }
  }
  next();
});

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
