/**
 * ============================================================================
 * UI Config Repository
 * ============================================================================
 *
 * Layer:
 * Data Access
 *
 * Responsibility:
 * Abstracts Mongoose interactions for dynamic UI configurations.
 * Acts as a pseudo Key-Value store abstraction over MongoDB.
 *
 * Called By:
 * src/modules/uiConfig/uiConfig.service.js
 *
 * Depends On:
 * src/modules/uiConfig/uiConfig.model.js
 * ============================================================================
 */
import UiConfig from './uiConfig.model.js';
import { CONFIG_KEY } from './uiConfig.constants.js';

/**
 * Fetches the global configuration singleton object.
 * lean() is used because this data is read frequently on the public site.
 *
 * @returns {Promise<Object>}
 */
export const findDefaultConfig = async () => {
  return await UiConfig.findOne({ key: CONFIG_KEY }).lean();
};

/**
 * Updates the hero section of the global config.
 * Uses upsert: true to gracefully initialize the config on first launch.
 *
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const updateWebsiteHeroConfig = async (payload) => {
  return await UiConfig.findOneAndUpdate(
    { key: CONFIG_KEY },
    { $set: { websiteHero: payload } },
    { upsert: true, new: true }
  ).lean();
};
