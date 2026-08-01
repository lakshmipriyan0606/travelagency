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
 * visitor / traffic data for admins. List endpoints stay lean; detail endpoints
 * load samples on demand.
 *
 * Called By:
 * src/modules/b2c/analytics/analytics.b2c.routes.js
 * src/modules/b2c/analytics/analytics.admin.routes.js
 *
 * Depends On:
 * src/modules/b2c/analytics/analytics.service.js
 * ============================================================================
 */
import * as analyticsService from './analytics.service.js';
import { sendSuccess } from '#shared/utils/response.js';

export const recordVisit = async (req, res, next) => {
  try {
    const result = await analyticsService.recordVisitService(req);
    if (result.skipped) {
      return sendSuccess(res, 200, result.message);
    }
    if (result.duplicate && !result.success) {
      return sendSuccess(res, 200, result.message);
    }
    return sendSuccess(res, result.duplicate ? 200 : 201, result.message);
  } catch (error) {
    next(error);
  }
};

/** List: daily visitor counts (30d). */
export const getDailyVisits = async (req, res, next) => {
  try {
    const data = await analyticsService.getDailyVisitsService();
    return sendSuccess(res, 200, 'Daily visits fetched', { data });
  } catch (error) {
    next(error);
  }
};

/** Detail: visitor samples for one UTC date. */
export const getDailyVisitDetails = async (req, res, next) => {
  try {
    const data = await analyticsService.getDailyVisitDetailsService(req.params.date);
    return sendSuccess(res, 200, 'Daily visit details fetched', { data });
  } catch (error) {
    next(error);
  }
};

/** Overview cards for Traffic Overview. */
export const getVisitorOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getVisitorOverviewService();
    return sendSuccess(res, 200, 'Visitor overview fetched', { data });
  } catch (error) {
    next(error);
  }
};

/** Device / browser / OS / country distributions. */
export const getVisitorDistribution = async (req, res, next) => {
  try {
    const data = await analyticsService.getVisitorDistributionService(req.query.days);
    return sendSuccess(res, 200, 'Visitor distribution fetched', { data });
  } catch (error) {
    next(error);
  }
};

/** Paginated recent visitors table. */
export const getRecentVisitors = async (req, res, next) => {
  try {
    const data = await analyticsService.getRecentVisitorsService(req.query);
    return sendSuccess(res, 200, 'Recent visitors fetched', { data });
  } catch (error) {
    next(error);
  }
};

/** Full visitor profile. */
export const getVisitorProfile = async (req, res, next) => {
  try {
    const data = await analyticsService.getVisitorProfileService(
      req.params.visitorId,
      req.query.date
    );
    return sendSuccess(res, 200, 'Visitor profile fetched', { data });
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
