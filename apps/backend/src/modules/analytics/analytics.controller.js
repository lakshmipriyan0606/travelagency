/**
 * ============================================================================
 * Analytics Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Exposes endpoints for tracking frontend visits and fetching aggregated
 * dashboard usage data for admins.
 *
 * Called By:
 * src/modules/analytics/analytics.b2c.routes.js
 * src/modules/analytics/analytics.admin.routes.js
 *
 * Depends On:
 * src/modules/analytics/analytics.service.js
 * ============================================================================
 */
import * as analyticsService from './analytics.service.js';
import { sendSuccess } from '#utils/response.js';

export const recordVisit = async (req, res, next) => {
  try {
    const result = await analyticsService.recordVisitService(req);
    if (result.skipped || result.duplicate) {
      return sendSuccess(res, 200, result.message);
    }
    return sendSuccess(res, 201, result.message);
  } catch (error) {
    next(error);
  }
};

export const getDailyVisits = async (req, res, next) => {
  try {
    const data = await analyticsService.getDailyVisitsService();
    return sendSuccess(res, 200, 'Daily visits fetched', { data });
  } catch (error) {
    next(error);
  }
};

export const getApiUsage = async (req, res, next) => {
  try {
    const usage = await analyticsService.getApiUsageService();
    return sendSuccess(res, 200, 'API usage fetched', usage);
  } catch (error) {
    next(error);
  }
};

export const cleanupLocalhostVisits = async (req, res, next) => {
  try {
    const result = await analyticsService.cleanupLocalhostVisitsService();
    return sendSuccess(res, 200, 'Localhost visits removed', { deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

export const runStartupLocalhostCleanup = analyticsService.runStartupLocalhostCleanupService;
