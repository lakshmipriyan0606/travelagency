/**
 * ============================================================================
 * Destination Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for "Popular Destinations" shown on the
 * storefront home page. Enforces strict limits and ordering.
 *
 * Called By:
 * src/modules/destinations/destination.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Destination title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Navigation location/city is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    alt: {
      type: String,
      default: 'Popular Destination',
    },

    // Controls the left-to-right display order on the storefront UI
    orderNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Destination =
  mongoose.models.Destination || mongoose.model('Destination', destinationSchema);
export default Destination;
