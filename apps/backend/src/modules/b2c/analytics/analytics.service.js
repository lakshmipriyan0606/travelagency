/**
 * ============================================================================
 * Analytics Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Central processing hub for visitor / traffic analytics.
 * Visit ingest accepts a rich optional payload while remaining backward
 * compatible with the legacy { visitorId, referrer, path } beacon.
 * (API hit aggregates for DevOps live outside this service.)
 *
 * Called By:
 * src/modules/b2c/analytics/analytics.controller.js
 *
 * Depends On:
 * src/modules/b2c/analytics/analytics.repository.js
 * src/modules/b2c/analytics/uaParser.js
 * src/shared/utils/requestOrigin.js
 * ============================================================================
 */
import * as analyticsRepository from './analytics.repository.js';
import {
  getClientIp,
  getUtcDateString,
  isLocalRequest,
  maskIp,
} from '#shared/utils/requestOrigin.js';
import { LOCALHOST_IP_MATCH } from './analytics.constants.js';
import { sanitizeVisitPayload } from './analytics.validation.js';
import { parseUserAgent, extractGeoFromHeaders, clampPageViews } from './uaParser.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function utcOffsetDays(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return getUtcDateString(d);
}

function sumTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function setIfEmpty(doc, key, value) {
  if (value === undefined || value === null || value === '') return;
  const cur = doc[key];
  if (cur === undefined || cur === null || cur === '' || cur === 'unknown' || cur === 'Unknown') {
    doc[key] = value;
  }
}

/** Fill browser/OS/device from UA when stored fields are missing (legacy rows). */
function enrichDeviceFields(d) {
  const parsed = parseUserAgent(d.userAgent);
  const blank = (v) => !v || v === 'Unknown' || v === 'unknown';
  return {
    browser: blank(d.browser) ? parsed.browser : d.browser,
    browserVersion: d.browserVersion || parsed.browserVersion || '',
    os: blank(d.os) ? parsed.os : d.os,
    osVersion: d.osVersion || parsed.osVersion || '',
    deviceType:
      blank(d.deviceType) || d.deviceType === 'unknown' ? parsed.deviceType : d.deviceType,
  };
}

function buildDetailProjection(d) {
  const device = enrichDeviceFields(d);
  return {
    visitorId: d.visitorId || '',
    sessionId: d.sessionId || '',
    userAgent: d.userAgent,
    ip: maskIp(d.ip),
    referrer: d.referrer || '',
    path: d.path || '',
    time: d.createdAt,
    firstVisit: d.firstVisit || d.createdAt,
    lastVisit: d.lastVisit || d.createdAt,
    visitCount: d.visitCount ?? 1,
    ...device,
    country: d.country || '',
    region: d.region || '',
    city: d.city || '',
    timezone: d.timezone || '',
    screenWidth: d.screenWidth,
    screenHeight: d.screenHeight,
    viewportWidth: d.viewportWidth,
    viewportHeight: d.viewportHeight,
    devicePixelRatio: d.devicePixelRatio,
    language: d.language || '',
    cookiesEnabled: d.cookiesEnabled,
    touchSupport: d.touchSupport,
    onlineStatus: d.onlineStatus,
    landingPage: d.landingPage || d.path || '',
    currentPage: d.currentPage || d.path || '',
    pageViewCount: d.pageViewCount ?? (d.pageViews?.length || 1),
    pageViews: Array.isArray(d.pageViews) ? d.pageViews.slice(-30) : [],
    utmSource: d.utmSource || '',
    utmMedium: d.utmMedium || '',
    utmCampaign: d.utmCampaign || '',
    utmTerm: d.utmTerm || '',
    utmContent: d.utmContent || '',
    pageLoad: d.pageLoad,
    fcp: d.fcp,
    lcp: d.lcp,
  };
}

/**
 * Persists / enriches a unique visit for the current UTC day.
 * Duplicate same-day beacons append page views and refresh last activity.
 */
export const recordVisitService = async (req) => {
  const payload = sanitizeVisitPayload(req.body || {});
  if (!payload.visitorId) {
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
  const parsed = parseUserAgent(userAgent);
  const geo = extractGeoFromHeaders(req.headers);
  const now = new Date();

  const path = payload.currentPage || payload.path || '';
  const pageView = {
    path,
    title: payload.pageTitle || '',
    referrer: payload.referrer || '',
    timestamp: now,
  };

  const existing = await analyticsRepository.findVisitorByDay(payload.visitorId, date);

  if (!existing) {
    try {
      await analyticsRepository.createVisitor({
        visitorId: payload.visitorId,
        date,
        userAgent,
        ip,
        referrer: payload.referrer || '',
        path,
        sessionId: payload.sessionId || '',
        userId: payload.userId || '',
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        browser: payload.browser || parsed.browser,
        browserVersion: parsed.browserVersion,
        os: payload.os || parsed.os,
        osVersion: parsed.osVersion,
        deviceType: payload.deviceType || parsed.deviceType,
        country: payload.country || geo.country || '',
        region: payload.region || geo.region || '',
        city: payload.city || geo.city || '',
        timezone: payload.timezone || '',
        screenWidth: payload.screenWidth,
        screenHeight: payload.screenHeight,
        viewportWidth: payload.viewportWidth,
        viewportHeight: payload.viewportHeight,
        devicePixelRatio: payload.devicePixelRatio,
        language: payload.language || '',
        cookiesEnabled: payload.cookiesEnabled,
        touchSupport: payload.touchSupport,
        onlineStatus: payload.onlineStatus,
        landingPage: payload.landingPage || path,
        currentPage: path,
        pageViewCount: 1,
        pageViews: path ? [pageView] : [],
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
        utmTerm: payload.utmTerm,
        utmContent: payload.utmContent,
        pageLoad: payload.pageLoad,
        fcp: payload.fcp,
        lcp: payload.lcp,
      });
      return { success: true, message: 'Visit recorded successfully' };
    } catch (err) {
      if (err.code !== 11000) throw err;
      // Race: another beacon won — fall through to enrich
    }
  }

  const doc = existing || (await analyticsRepository.findVisitorByDay(payload.visitorId, date));
  if (!doc) {
    return { duplicate: true, message: 'Visit already recorded for today' };
  }

  const views = Array.isArray(doc.pageViews) ? [...doc.pageViews] : [];
  const lastPath = views.length ? views[views.length - 1]?.path : doc.currentPage;
  if (path && path !== lastPath) {
    views.push(pageView);
  } else if (path && views.length === 0) {
    views.push(pageView);
  }

  doc.lastVisit = now;
  // Increment visitCount only on new session id within the day
  if (payload.sessionId && payload.sessionId !== doc.sessionId) {
    doc.visitCount = (doc.visitCount || 1) + 1;
    doc.sessionId = payload.sessionId;
  } else if (payload.sessionId && !doc.sessionId) {
    doc.sessionId = payload.sessionId;
  }

  if (path) {
    doc.currentPage = path;
    doc.path = path;
  }
  if (payload.referrer) doc.referrer = payload.referrer;
  doc.pageViews = clampPageViews(views);
  doc.pageViewCount = Math.max(doc.pageViewCount || 0, doc.pageViews.length);

  setIfEmpty(doc, 'landingPage', payload.landingPage || path);
  setIfEmpty(doc, 'browser', payload.browser || parsed.browser);
  setIfEmpty(doc, 'browserVersion', parsed.browserVersion);
  setIfEmpty(doc, 'os', payload.os || parsed.os);
  setIfEmpty(doc, 'osVersion', parsed.osVersion);
  if (!doc.deviceType || doc.deviceType === 'unknown') {
    doc.deviceType = payload.deviceType || parsed.deviceType;
  }
  setIfEmpty(doc, 'country', payload.country || geo.country);
  setIfEmpty(doc, 'region', payload.region || geo.region);
  setIfEmpty(doc, 'city', payload.city || geo.city);
  setIfEmpty(doc, 'timezone', payload.timezone);
  setIfEmpty(doc, 'language', payload.language);
  setIfEmpty(doc, 'utmSource', payload.utmSource);
  setIfEmpty(doc, 'utmMedium', payload.utmMedium);
  setIfEmpty(doc, 'utmCampaign', payload.utmCampaign);
  setIfEmpty(doc, 'utmTerm', payload.utmTerm);
  setIfEmpty(doc, 'utmContent', payload.utmContent);

  if (payload.screenWidth != null) doc.screenWidth = payload.screenWidth;
  if (payload.screenHeight != null) doc.screenHeight = payload.screenHeight;
  if (payload.viewportWidth != null) doc.viewportWidth = payload.viewportWidth;
  if (payload.viewportHeight != null) doc.viewportHeight = payload.viewportHeight;
  if (payload.devicePixelRatio != null) doc.devicePixelRatio = payload.devicePixelRatio;
  if (payload.cookiesEnabled != null) doc.cookiesEnabled = payload.cookiesEnabled;
  if (payload.touchSupport != null) doc.touchSupport = payload.touchSupport;
  if (payload.onlineStatus != null) doc.onlineStatus = payload.onlineStatus;
  if (payload.pageLoad != null) doc.pageLoad = payload.pageLoad;
  if (payload.fcp != null) doc.fcp = payload.fcp;
  if (payload.lcp != null) doc.lcp = payload.lcp;
  if (payload.userId) doc.userId = payload.userId;
  if (!doc.firstVisit) doc.firstVisit = doc.createdAt || now;

  await doc.save();
  return { success: true, message: 'Visit enriched successfully', duplicate: Boolean(existing) };
};

/**
 * List: daily unique visitor counts for the past 30 days (no per-visitor details).
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
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
        pageViews: { $sum: { $ifNull: ['$pageViewCount', 1] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return visits;
};

/**
 * Detail: visitor activity samples for a single UTC date.
 */
export const getDailyVisitDetailsService = async (date) => {
  if (!date || !DATE_RE.test(date)) {
    const error = new Error('Valid date (YYYY-MM-DD) is required');
    error.statusCode = 400;
    throw error;
  }

  const [summary] = await analyticsRepository.aggregateVisitors([
    {
      $match: {
        date,
        $nor: [LOCALHOST_IP_MATCH],
      },
    },
    { $sort: { lastVisit: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
        details: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        count: 1,
        details: { $slice: ['$details', 100] },
      },
    },
  ]);

  if (!summary) {
    return { _id: date, count: 0, details: [] };
  }

  return {
    _id: summary._id,
    count: summary.count,
    details: (summary.details || []).map(buildDetailProjection),
  };
};

/**
 * Traffic overview cards: today / yesterday / 7d / 30d / unique / returning / page views + trends.
 */
export const getVisitorOverviewService = async () => {
  const today = getUtcDateString();
  const yesterday = utcOffsetDays(-1);
  const d7 = utcOffsetDays(-6);
  const d14 = utcOffsetDays(-13);
  const d30 = utcOffsetDays(-29);
  const d60 = utcOffsetDays(-59);

  const baseNor = { $nor: [LOCALHOST_IP_MATCH] };

  const countBetween = async (from, to) => {
    const [row] = await analyticsRepository.aggregateVisitors([
      { $match: { date: { $gte: from, $lte: to }, ...baseNor } },
      {
        $group: {
          _id: null,
          /** Day-docs (visits/days) — not used for unique cards */
          dayDocs: { $sum: 1 },
          pageViews: { $sum: { $ifNull: ['$pageViewCount', 1] } },
          visitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          _id: 0,
          count: { $size: '$visitors' },
          pageViews: 1,
          dayDocs: 1,
        },
      },
    ]);
    return { count: row?.count || 0, pageViews: row?.pageViews || 0, dayDocs: row?.dayDocs || 0 };
  };

  const distinctBetween = async (from, to) => {
    const ids = await analyticsRepository.aggregateVisitors([
      { $match: { date: { $gte: from, $lte: to }, ...baseNor } },
      { $group: { _id: '$visitorId' } },
      { $count: 'n' },
    ]);
    return ids[0]?.n || 0;
  };

  const returningBetween = async (from, to) => {
    const rows = await analyticsRepository.aggregateVisitors([
      { $match: { date: { $gte: from, $lte: to }, ...baseNor } },
      {
        $group: {
          _id: '$visitorId',
          days: { $addToSet: '$date' },
          maxVisitCount: { $max: '$visitCount' },
        },
      },
      {
        $match: {
          $or: [{ 'days.1': { $exists: true } }, { maxVisitCount: { $gt: 1 } }],
        },
      },
      { $count: 'n' },
    ]);
    return rows[0]?.n || 0;
  };

  const [todayStats, yesterdayStats, last7, prev7, last30, prev30, unique30, returning30] =
    await Promise.all([
      countBetween(today, today),
      countBetween(yesterday, yesterday),
      countBetween(d7, today),
      countBetween(d14, utcOffsetDays(-7)),
      countBetween(d30, today),
      countBetween(d60, utcOffsetDays(-30)),
      distinctBetween(d30, today),
      returningBetween(d30, today),
    ]);

  return {
    today: todayStats.count,
    yesterday: yesterdayStats.count,
    last7d: last7.count,
    last30d: last30.count,
    totalUnique: unique30,
    returning: returning30,
    pageViews: last30.pageViews,
    trends: {
      todayVsYesterday: sumTrend(todayStats.count, yesterdayStats.count),
      last7d: sumTrend(last7.count, prev7.count),
      last30d: sumTrend(last30.count, prev30.count),
    },
  };
};

/**
 * Distribution breakdowns — parse UA for legacy rows so charts aren't all "Unknown".
 */
export const getVisitorDistributionService = async (days = 30) => {
  const safeDays = Math.min(Math.max(Number(days) || 30, 1), 90);
  const from = utcOffsetDays(-(safeDays - 1));
  const today = getUtcDateString();

  const docs = await analyticsRepository.aggregateVisitors([
    {
      $match: {
        date: { $gte: from, $lte: today },
        $nor: [LOCALHOST_IP_MATCH],
      },
    },
    { $sort: { lastVisit: -1, createdAt: -1 } },
    // One passport → one contribution to charts (no multi-day duplicate weight)
    {
      $group: {
        _id: '$visitorId',
        userAgent: { $first: '$userAgent' },
        browser: { $first: '$browser' },
        os: { $first: '$os' },
        deviceType: { $first: '$deviceType' },
        country: { $first: '$country' },
      },
    },
  ]);

  const bump = (map, key) => {
    const name = key && String(key).trim() ? String(key).trim() : 'Unknown';
    map[name] = (map[name] || 0) + 1;
  };

  const deviceType = {};
  const browser = {};
  const os = {};
  const country = {};

  for (const d of docs || []) {
    const enriched = enrichDeviceFields(d);
    bump(deviceType, enriched.deviceType);
    bump(browser, enriched.browser);
    bump(os, enriched.os);
    bump(country, d.country);
  }

  const toList = (map) =>
    Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

  return {
    days: safeDays,
    deviceType: toList(deviceType),
    browser: toList(browser),
    os: toList(os),
    country: toList(country),
  };
};

/**
 * Paginated recent visitor rows for the admin table.
 * Device filter uses enriched deviceType (same as the table Device column),
 * so legacy `unknown` rows classified from UA still match Desktop/Mobile/Tablet.
 */
export const getRecentVisitorsService = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  const search = String(query.search || '').trim();
  const deviceType = String(query.deviceType || '')
    .trim()
    .toLowerCase();
  const days = Math.min(Math.max(Number(query.days) || 30, 1), 90);
  const from = utcOffsetDays(-(days - 1));
  const deviceFilterActive = ['desktop', 'mobile', 'tablet', 'unknown'].includes(deviceType);

  const mongoFilter = {
    date: { $gte: from },
    $nor: [LOCALHOST_IP_MATCH],
  };

  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    mongoFilter.$and = [
      {
        $or: [
          { visitorId: re },
          { path: re },
          { currentPage: re },
          { landingPage: re },
          { referrer: re },
          { browser: re },
          { os: re },
          { country: re },
          { city: re },
          { ip: re },
        ],
      },
    ];
  }

  // Device filter needs enrich-then-filter (matches UI). Pull a wider window,
  // then paginate in memory. Unfiltered path keeps indexed skip/limit.
  const { items: rawItems, total: rawTotal } = await analyticsRepository.findRecentVisitors({
    filter: mongoFilter,
    skip: deviceFilterActive ? 0 : skip,
    limit: deviceFilterActive ? 5000 : limit,
    sort: { lastVisit: -1, createdAt: -1 },
  });

  let items = rawItems.map((d) => ({
    ...buildDetailProjection(d),
    date: d.date,
    daysSeen: d.daysSeen || 1,
    visitCount: d.lifetimeVisitCount || d.visitCount || 1,
  }));

  if (deviceFilterActive) {
    items = items.filter((row) => String(row.deviceType || '').toLowerCase() === deviceType);
  }

  const total = deviceFilterActive ? items.length : rawTotal;
  const pageItems = deviceFilterActive ? items.slice(skip, skip + limit) : items;

  return {
    items: pageItems,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

/**
 * Full visitor profile (latest day, or specific date).
 */
export const getVisitorProfileService = async (visitorId, date) => {
  if (!visitorId || typeof visitorId !== 'string') {
    const error = new Error('visitorId is required');
    error.statusCode = 400;
    throw error;
  }

  if (date && !DATE_RE.test(date)) {
    const error = new Error('Valid date (YYYY-MM-DD) is required');
    error.statusCode = 400;
    throw error;
  }

  const doc = await analyticsRepository.findVisitorById(visitorId.trim(), date || undefined);
  if (!doc) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }

  // Lifetime-ish: count distinct days this visitor appeared (within TTL window)
  const dayCount = await analyticsRepository.aggregateVisitors([
    { $match: { visitorId: visitorId.trim(), $nor: [LOCALHOST_IP_MATCH] } },
    { $group: { _id: '$date' } },
    { $count: 'n' },
  ]);

  return {
    ...buildDetailProjection(doc),
    date: doc.date,
    daysSeen: dayCount[0]?.n || 1,
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
      analyticsRepository.deleteApiHitMany({ route: { $regex: '/analytics' } }),
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
