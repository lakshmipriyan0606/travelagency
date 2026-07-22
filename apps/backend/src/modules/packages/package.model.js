/**
 * ============================================================================
 * Package Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for Travel Packages and Activities.
 * Enforces data integrity at the database layer.
 *
 * Called By:
 * src/modules/packages/package.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    // 'type' determines if the document is a multi-day package or a single-day activity. Indexed for fast filtering.
    type: { type: String, enum: ['package', 'activity'], default: 'package', index: true },

    // Core details
    packageName: { type: String, required: true },
    packageDescription: { type: String, required: true },
    packageType: { type: String, default: '' },

    // Travel specifics
    daysAndNights: { type: String, default: '' },
    hotelName: { type: String },

    // Pricing
    price: { type: Number, default: 0 },
    offerPrice: { type: Number, default: 0 },

    // Geography
    location: { type: String, required: true },
    country: { type: String, required: true },

    // Marketing & Ranking
    isBestPackage: { type: Boolean },
    bestRank: { type: Number },

    // Operational Flags
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

    // Activity specifics
    activityCategory: { type: String, default: null },

    // Media
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],

    // Search Engine Optimization
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: { type: String, default: '' },
    },

    // Soft deletion flag to preserve historical relationships (e.g. bookings)
    isDeleted: { type: Boolean, default: false },

    // Ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Itinerary details (nested days and time slots)
    days: [
      {
        dayTitle: { type: String, default: '' },
        slots: [
          {
            slotType: { type: String, default: '' },
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            imageUrl: { type: String, default: '' },
            imageAlt: { type: String, default: '' },
          },
        ],
      },
    ],

    languages: { type: String, default: '' },

    // Social features (Users who favorited this package)
    likes: [
      {
        userId: { type: String, required: true },
        liked: { type: Boolean, required: true },
      },
    ],

    // Additional operational details
    operatingHours: { type: String, default: '' },
    isInstantConfirmation: { type: Boolean, default: false },
    isNonRefundable: { type: Boolean, default: false },
    highlights: [{ type: String, default: '' }],
  },
  { timestamps: true }
);

// ============================================================================
// Indexes
// ----------------------------------------------------------------------------
// 1. Compound index for geographic filtering
// 2. Compound index for type-based filtering and status toggles
// 3. Text index for full-text search across titles and descriptions
// ============================================================================
packageSchema.index({ location: 1, country: 1, isActive: 1 });
packageSchema.index({ type: 1, status: 1 });
packageSchema.index({ packageName: 'text', packageDescription: 'text' });

export const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);
export default Package;
