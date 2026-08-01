export const validateVisitorInput = (data) => {
  const errors = [];
  if (!data.visitorId || typeof data.visitorId !== 'string' || !data.visitorId.trim()) {
    errors.push('visitorId is required.');
  }
  return { isValid: errors.length === 0, errors };
};

/** Coerce optional client payload fields into safe primitives. */
export const sanitizeVisitPayload = (body = {}) => {
  const str = (v, max = 500) => {
    if (v == null) return '';
    return String(v).trim().slice(0, max);
  };
  const num = (v) => {
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const bool = (v) => (typeof v === 'boolean' ? v : undefined);

  return {
    visitorId: str(body.visitorId, 128),
    sessionId: str(body.sessionId, 128),
    userId: str(body.userId, 128),
    referrer: str(body.referrer, 1000),
    path: str(body.path || body.currentPage, 500),
    landingPage: str(body.landingPage, 500),
    currentPage: str(body.currentPage || body.path, 500),
    pageTitle: str(body.pageTitle || body.title, 300),
    timezone: str(body.timezone, 64),
    language: str(body.language, 32),
    country: str(body.country, 64),
    region: str(body.region, 64),
    city: str(body.city, 64),
    screenWidth: num(body.screenWidth),
    screenHeight: num(body.screenHeight),
    viewportWidth: num(body.viewportWidth),
    viewportHeight: num(body.viewportHeight),
    devicePixelRatio: num(body.devicePixelRatio),
    cookiesEnabled: bool(body.cookiesEnabled),
    touchSupport: bool(body.touchSupport),
    onlineStatus: bool(body.onlineStatus),
    utmSource: str(body.utmSource, 200),
    utmMedium: str(body.utmMedium, 200),
    utmCampaign: str(body.utmCampaign, 200),
    utmTerm: str(body.utmTerm, 200),
    utmContent: str(body.utmContent, 200),
    pageLoad: num(body.pageLoad),
    fcp: num(body.fcp),
    lcp: num(body.lcp),
    // Optional client-hint overrides (server UA parse still runs)
    deviceType: ['desktop', 'mobile', 'tablet', 'unknown'].includes(body.deviceType)
      ? body.deviceType
      : undefined,
    browser: str(body.browser, 64) || undefined,
    os: str(body.os, 64) || undefined,
  };
};
