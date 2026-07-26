/**
 * ============================================================================
 * Analytics Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Central processing hub for internal application analytics. Runs complex
 * MongoDB aggregation pipelines to generate dashboard charts. Also manages
 * data sanitization (IP masking) and automatic cleanup of localhost/dev noise.
 *
 * Called By:
 * src/modules/analytics/analytics.controller.js
 *
 * Depends On:
 * src/modules/analytics/analytics.repository.js
 * src/utils/requestOrigin.js
 * ============================================================================
 */
import * as analyticsRepository from './analytics.repository.js';
import { getClientIp, getUtcDateString, isLocalRequest, maskIp } from '#utils/requestOrigin.js';
import { LOCALHOST_IP_MATCH, EXCLUDE_ANALYTICS_ROUTE } from './analytics.constants.js';

/**
 * Persists a unique visit to the site for the current day.
 * Skips counting local developer traffic.
 */
export const recordVisitService = async (req) => {
  const { visitorId, referrer, path } = req.body;
  if (!visitorId) {
    const error = new Error('visitorId is required');
    error.statusCode = 400;
    throw error;
  }

  if (isLocalRequest(req)) {
    return { skipped: true, message: 'Local visit skipped' };
  }

  const date = getUtcDateString();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = getClientIp(req);

  try {
    await analyticsRepository.createVisitor({
      visitorId,
      date,
      userAgent,
      ip,
      referrer: referrer || '',
      path: path || '',
    });
    return { success: true, message: 'Visit recorded successfully' };
  } catch (err) {
    if (err.code === 11000) {
      return { duplicate: true, message: 'Visit already recorded for today' };
    }
    throw err;
  }
};

/**
 * Aggregates visitor counts for the past 30 days to build a time-series graph.
 * Sanitizes output by masking raw IP addresses before returning to the frontend.
 */
export const getDailyVisitsService = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateLimit = getUtcDateString(thirtyDaysAgo);

  const visits = await analyticsRepository.aggregateVisitors([
    {
      $match: {
        date: { $gte: dateLimit },
        $nor: [LOCALHOST_IP_MATCH],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
        details: {
          $push: {
            userAgent: '$userAgent',
            ip: '$ip',
            referrer: '$referrer',
            path: '$path',
            time: '$createdAt',
          },
        },
      },
    },
    {
      $project: {
        count: 1,
        details: {
          $map: {
            input: { $slice: ['$details', 10] },
            as: 'd',
            in: {
              userAgent: '$$d.userAgent',
              ip: '$$d.ip',
              referrer: '$$d.referrer',
              path: '$$d.path',
              time: '$$d.time',
            },
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return visits.map((day) => ({
    ...day,
    details: day.details.map((d) => ({
      ...d,
      ip: maskIp(d.ip),
    })),
  }));
};

/**
 * Computes multiple aggregation facets for API tracking (totals, daily breakdown,
 * top endpoints, status codes).
 */
export const getApiUsageService = async () => {
  const today = getUtcDateString();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateLimit = getUtcDateString(thirtyDaysAgo);

  const [todayTotalResult, dailyStats, topRoutes, routeDetails] = await Promise.all([
    analyticsRepository.aggregateApiHits([
      { $match: { date: today, ...EXCLUDE_ANALYTICS_ROUTE } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]),
    analyticsRepository.aggregateApiHits([
      { $match: { date: { $gte: dateLimit }, ...EXCLUDE_ANALYTICS_ROUTE } },
      { $group: { _id: '$date', count: { $sum: '$count' } } },
      { $sort: { _id: 1 } },
    ]),
    analyticsRepository.aggregateApiHits([
      { $match: { date: { $gte: dateLimit }, ...EXCLUDE_ANALYTICS_ROUTE } },
      {
        $group: {
          _id: { method: '$method', route: '$route' },
          count: { $sum: '$count' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          route: { $concat: ['$_id.method', ' ', '$_id.route'] },
          method: '$_id.method',
          path: '$_id.route',
          count: 1,
        },
      },
    ]),
    analyticsRepository.aggregateApiHits([
      { $match: { date: { $gte: dateLimit }, ...EXCLUDE_ANALYTICS_ROUTE } },
      {
        $group: {
          _id: { method: '$method', route: '$route', status: '$status' },
          count: { $sum: '$count' },
        },
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: { method: '$_id.method', route: '$_id.route' },
          total: { $sum: '$count' },
          statuses: {
            $push: { status: '$_id.status', count: '$count' },
          },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          route: { $concat: ['$_id.method', ' ', '$_id.route'] },
          method: '$_id.method',
          path: '$_id.route',
          total: 1,
          statuses: 1,
        },
      },
    ]),
  ]);

  return {
    todayTotal: todayTotalResult[0]?.total || 0,
    dailyStats,
    topRoutes,
    routeDetails,
  };
};

export const cleanupLocalhostVisitsService = async () => {
  const result = await analyticsRepository.deleteVisitorMany(LOCALHOST_IP_MATCH);
  return { deletedCount: result.deletedCount };
};

export const runStartupLocalhostCleanupService = async () => {
  try {
    const [visitorResult, apiHitResult] = await Promise.all([
      analyticsRepository.deleteVisitorMany(LOCALHOST_IP_MATCH),
      analyticsRepository.deleteApiHitMany({ route: { $regex: '^/api/analytics' } }),
    ]);
    if (visitorResult.deletedCount > 0) {
      console.log(`Removed ${visitorResult.deletedCount} localhost visitor record(s)`);
    }
    if (apiHitResult.deletedCount > 0) {
      console.log(`Removed ${apiHitResult.deletedCount} analytics API hit record(s)`);
    }
  } catch (error) {
    console.error('Startup cleanup failed:', error.message);
  }
};
