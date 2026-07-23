/**
 * ============================================================================
 * Website Hero Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests to manage multiple hero configurations.
 * Handles aggressive caching headers for the public read endpoints.
 *
 * Called By:
 * src/modules/websiteHero/websiteHero.b2c.routes.js
 * src/modules/websiteHero/websiteHero.admin.routes.js
 *
 * Depends On:
 * src/modules/websiteHero/websiteHero.service.js
 * ============================================================================
 */
import * as websiteHeroService from './websiteHero.service.js';
import { sendSuccess } from '#utils/response.js';

export const getActiveHero = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const data = await websiteHeroService.getActiveHeroService();
    return sendSuccess(res, 200, 'Active hero fetched', { data });
  } catch (error) {
    next(error);
  }
};

export const getAllHeroes = async (req, res, next) => {
  try {
    const list = await websiteHeroService.getAllHeroesService();
    return sendSuccess(res, 200, 'Heroes fetched', { data: list });
  } catch (error) {
    next(error);
  }
};

export const createHero = async (req, res, next) => {
  try {
    const doc = await websiteHeroService.createHeroService(req.body);
    return sendSuccess(res, 201, 'Hero created', { data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateHero = async (req, res, next) => {
  try {
    const doc = await websiteHeroService.updateHeroService(req.params.id, req.body);
    return sendSuccess(res, 200, 'Hero updated', { data: doc });
  } catch (error) {
    next(error);
  }
};

export const deleteHero = async (req, res, next) => {
  try {
    await websiteHeroService.deleteHeroService(req.params.id);
    return sendSuccess(res, 200, 'Hero deleted');
  } catch (error) {
    next(error);
  }
};
