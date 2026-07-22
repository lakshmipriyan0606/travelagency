/**
 * ============================================================================
 * UI Config Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests to fetch or modify global UI settings.
 *
 * Called By:
 * src/modules/uiConfig/uiConfig.b2c.routes.js
 * src/modules/uiConfig/uiConfig.admin.routes.js
 *
 * Depends On:
 * src/modules/uiConfig/uiConfig.service.js
 * ============================================================================
 */
import * as uiConfigService from './uiConfig.service.js';

/**
 * Fetch the public website hero config.
 *
 * Request Flow:
 * Client
 *   ↓
 * Route (GET /api/v1/b2c/ui-config/hero)
 *   ↓
 * Controller (getWebsiteHero)
 *   ↓
 * Service (getWebsiteHeroConfigService)
 *   ↓
 * Database (UiConfig Singleton)
 *   ↓
 * Response (200 OK)
 */
export const getWebsiteHero = async (req, res) => {
  try {
    const data = await uiConfigService.getWebsiteHeroConfigService();
    return res.status(200).json({ data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch website hero config', error: error.message });
  }
};

/**
 * Updates the website hero config.
 *
 * Request Flow:
 * Admin Client
 *   ↓
 * Route (PUT /api/v1/b2c-admin/ui-config/hero)
 *   ↓
 * Controller (updateWebsiteHero)
 *   ↓
 * Service (updateWebsiteHeroConfigService) -> Normalization
 *   ↓
 * Database (Upsert UiConfig Singleton)
 *   ↓
 * Response (200 OK)
 */
export const updateWebsiteHero = async (req, res) => {
  try {
    const data = await uiConfigService.updateWebsiteHeroConfigService(req.body);
    return res.status(200).json({ message: 'Website hero updated', data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to update website hero config', error: error.message });
  }
};
