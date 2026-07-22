/**
 * ============================================================================
 * Website Hero Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for multiple hero slider variants. Allows
 * admins to prepare different seasonal banners and toggle which one is active.
 *
 * Called By:
 * src/modules/websiteHero/websiteHero.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const websiteHeroSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Best Travel Agency in Malaysia' },
    description: { type: String, default: '' },

    // Array of sliding images for the background
    backgroundImages: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],

    // Controls which banner variant is currently visible to users
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const WebsiteHero =
  mongoose.models.WebsiteHero || mongoose.model('WebsiteHero', websiteHeroSchema);
export default WebsiteHero;
