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

/**
 * Fetch the currently active hero configuration.
 *
 * Request Flow:
 * Client
 *   ↓
 * Route (GET /api/v1/b2c/website-hero/active)
 *   ↓
 * Controller (getActiveHero) -> Sets Cache-Control headers
 *   ↓
 * Service (getActiveHeroService)
 *   ↓
 * Database (Find active variant)
 *   ↓
 * Response (200 OK)
 */
export const getActiveHero = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const data = await websiteHeroService.getActiveHeroService();
    return res.status(200).json({ data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch active website hero', error: error.message });
  }
};

export const getAllHeroes = async (req, res) => {
  try {
    const list = await websiteHeroService.getAllHeroesService();
    return res.status(200).json({ data: list });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch hero list', error: error.message });
  }
};

export const createHero = async (req, res) => {
  try {
    const doc = await websiteHeroService.createHeroService(req.body);
    return res.status(201).json({ message: 'Hero created', data: doc });
  } catch (error) {
    const status = error.statusCode || 500;
    return res
      .status(status)
      .json({ message: error.message || 'Failed to create hero', error: error.message });
  }
};

export const updateHero = async (req, res) => {
  try {
    const doc = await websiteHeroService.updateHeroService(req.params.id, req.body);
    return res.status(200).json({ message: 'Hero updated', data: doc });
  } catch (error) {
    const status = error.statusCode || 500;
    return res
      .status(status)
      .json({ message: error.message || 'Failed to update hero', error: error.message });
  }
};

export const deleteHero = async (req, res) => {
  try {
    await websiteHeroService.deleteHeroService(req.params.id);
    return res.status(200).json({ message: 'Hero deleted' });
  } catch (error) {
    const status = error.statusCode || 500;
    return res
      .status(status)
      .json({ message: error.message || 'Failed to delete hero', error: error.message });
  }
};
