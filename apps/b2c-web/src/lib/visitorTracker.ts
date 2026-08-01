/**
 * Client-side visitor analytics beacon for B2C web.
 * Collects identity, device, display, UTM, and basic web vitals,
 * then POSTs to the public /analytics/visit endpoint.
 */

const VISITOR_KEY = 'ta_visitor_id';
const VISITOR_COOKIE = 'ta_visitor_passport';
const SESSION_KEY = 'ta_session_id';
const LANDING_KEY = 'ta_landing_page';
const UTM_KEY = 'ta_utm';

function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  // 400 days — stable passport across visits (same browser)
  const maxAge = 60 * 60 * 24 * 400;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Stable visitor passport: one ID per browser.
 * Prefer localStorage, fall back to cookie, never mint a new ID if either has one.
 */
function getVisitorPassport(): string {
  let fromStore: string | null = null;
  try {
    fromStore = localStorage.getItem(VISITOR_KEY);
  } catch {
    fromStore = null;
  }
  const fromCookie = readCookie(VISITOR_COOKIE);
  const id = fromStore || fromCookie || uuid();

  try {
    localStorage.setItem(VISITOR_KEY, id);
  } catch {
    /* private mode */
  }
  writeCookie(VISITOR_COOKIE, id);
  return id;
}

function getOrCreateSession(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

function parseUtm(search: string) {
  const params = new URLSearchParams(search);
  const utm = {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmTerm: params.get('utm_term') || '',
    utmContent: params.get('utm_content') || '',
  };
  const hasAny = Object.values(utm).some(Boolean);
  if (hasAny) {
    try {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    } catch {
      /* ignore */
    }
    return utm;
  }
  try {
    const cached = sessionStorage.getItem(UTM_KEY);
    if (cached) return JSON.parse(cached) as typeof utm;
  } catch {
    /* ignore */
  }
  return utm;
}

function getLandingPage(pathname: string): string {
  try {
    let landing = sessionStorage.getItem(LANDING_KEY);
    if (!landing) {
      landing = pathname || '/';
      sessionStorage.setItem(LANDING_KEY, landing);
    }
    return landing;
  } catch {
    return pathname || '/';
  }
}

function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet|PlayBook/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return 'tablet';
  }
  if (/Mobi|Android|iPhone|iPod|webOS|BlackBerry|IEMobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function readPerf(): { pageLoad?: number; fcp?: number; lcp?: number } {
  const out: { pageLoad?: number; fcp?: number; lcp?: number } = {};
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav && Number.isFinite(nav.loadEventEnd) && nav.loadEventEnd > 0) {
      out.pageLoad = Math.round(nav.loadEventEnd);
    }
    const paints = performance.getEntriesByType('paint');
    const fcp = paints.find((p) => p.name === 'first-contentful-paint');
    if (fcp) out.fcp = Math.round(fcp.startTime);

    const lcpEntries = performance.getEntriesByType(
      'largest-contentful-paint'
    ) as PerformanceEntry[];
    if (lcpEntries.length) {
      out.lcp = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
    } else if (typeof PerformanceObserver !== 'undefined') {
      // Best-effort: some browsers only expose LCP via observer buffer
      try {
        const obs = new PerformanceObserver(() => undefined);
        obs.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);
        const buffered = obs.takeRecords?.() || [];
        if (buffered.length) {
          out.lcp = Math.round(buffered[buffered.length - 1].startTime);
        }
        obs.disconnect();
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* Performance API unavailable */
  }
  return out;
}

function buildPayload(pathname: string) {
  const visitorId = getVisitorPassport();
  const sessionId = getOrCreateSession();
  const path = pathname || window.location.pathname || '/';
  const utm = parseUtm(window.location.search || '');
  const perf = readPerf();

  let timezone = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    timezone = '';
  }

  return {
    visitorId,
    sessionId,
    path,
    currentPage: path,
    landingPage: getLandingPage(path),
    pageTitle: typeof document !== 'undefined' ? document.title : '',
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    timezone,
    language: navigator.language || '',
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    cookiesEnabled: navigator.cookieEnabled,
    touchSupport: 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0,
    onlineStatus: navigator.onLine,
    deviceType: detectDeviceType(),
    ...utm,
    ...perf,
  };
}

function resolveVisitUrl(): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace(
    /\/$/,
    ''
  );
  // Support both .../api/v1/b2c and bare .../api bases
  if (/\/v1\/b2c$/i.test(base)) {
    return `${base}/analytics/visit`;
  }
  if (/\/api$/i.test(base)) {
    return `${base}/v1/b2c/analytics/visit`;
  }
  return `${base}/analytics/visit`;
}

let lastSentPath = '';
let lastSentAt = 0;

/**
 * Fire-and-forget visit beacon. Dedupes identical path within 2s.
 */
export async function trackVisit(pathname?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const path = pathname || window.location.pathname || '/';
  const now = Date.now();
  if (path === lastSentPath && now - lastSentAt < 2000) return;
  lastSentPath = path;
  lastSentAt = now;

  const payload = buildPayload(path);
  const url = resolveVisitUrl();
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      credentials: 'omit',
      keepalive: true,
    });
  } catch {
    /* analytics must never break the page */
  }
}
