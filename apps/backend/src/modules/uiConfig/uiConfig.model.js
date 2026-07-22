/**
 * ============================================================================
 * UI Config Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for dynamic storefront configurations
 * (like the website hero section) controllable via the Admin panel.
 *
 * Called By:
 * src/modules/uiConfig/uiConfig.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const uiConfigSchema = new mongoose.Schema(
  {
    // A unique identifier used to fetch the singleton config object (e.g., 'main_config')
    key: { type: String, required: true, unique: true, index: true },

    // Configurable Hero Section
    websiteHero: {
      title: { type: String, default: 'Best Travel Agency in Malaysia' },
      description: { type: String, default: '' },
      backgroundImages: [
        {
          url: { type: String, default: '' },
          alt: { type: String, default: '' },
        },
      ],
    },
  },
  { timestamps: true }
);

// ============================================================================
// Indexes
// ----------------------------------------------------------------------------
// 1. Single index on the 'key' field since this operates as a Key-Value store
// ============================================================================
export const UiConfig = mongoose.models.UiConfig || mongoose.model('UiConfig', uiConfigSchema);
export default UiConfig;
