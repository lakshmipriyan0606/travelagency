/**
 * ============================================================================
 * UI Config Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Enforces business logic for dynamic UI configuration. Sanitizes incoming
 * image payload formats and injects default constants if missing.
 *
 * Called By:
 * src/modules/uiConfig/uiConfig.controller.js
 *
 * Depends On:
 * src/modules/uiConfig/uiConfig.repository.js
 * ============================================================================
 */
import * as uiConfigRepository from './uiConfig.repository.js';
import { normalizeImages } from './uiConfig.validation.js';
import { DEFAULT_HERO_TITLE } from './uiConfig.constants.js';

/**
 * Retrieves the website hero configuration.
 *
 * Business Intent:
 * Normalizes empty fields with system defaults so the storefront
 * never breaks due to missing config data.
 *
 * @returns {Promise<Object>} Safe UI Config payload
 */
export const getWebsiteHeroConfigService = async () => {
  const doc = await uiConfigRepository.findDefaultConfig();
  const hero = doc?.websiteHero || {};
  return {
    title: hero.title || DEFAULT_HERO_TITLE,
    description: hero.description || '',
    backgroundImages: normalizeImages(hero.backgroundImages, hero.backgroundImageUrl),
  };
};

/**
 * Saves a new website hero configuration.
 *
 * Business Intent:
 * Sanitizes input (converting numbers/nulls to strings) to prevent frontend crashes,
 * and normalizes legacy single-image configurations into the modern array structure.
 *
 * @param {Object} body
 * @returns {Promise<Object>} Updated UI Config payload
 */
export const updateWebsiteHeroConfigService = async (body) => {
  const { title, description, backgroundImages, backgroundImageUrl } = body || {};

  const payload = {
    title: (title ?? '').toString(),
    description: (description ?? '').toString(),
    backgroundImages: normalizeImages(backgroundImages, backgroundImageUrl),
  };

  const updated = await uiConfigRepository.updateWebsiteHeroConfig(payload);
  return updated.websiteHero;
};
