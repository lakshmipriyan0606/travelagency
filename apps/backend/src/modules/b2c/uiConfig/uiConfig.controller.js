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
import { sendSuccess } from '#utils/response.js';

export const getWebsiteHero = async (req, res, next) => {
  try {
    const data = await uiConfigService.getWebsiteHeroConfigService();
    return sendSuccess(res, 200, 'Website hero config fetched', { data });
  } catch (error) {
    next(error);
  }
};

export const updateWebsiteHero = async (req, res, next) => {
  try {
    const data = await uiConfigService.updateWebsiteHeroConfigService(req.body);
    return sendSuccess(res, 200, 'Website hero updated', { data });
  } catch (error) {
    next(error);
  }
};
