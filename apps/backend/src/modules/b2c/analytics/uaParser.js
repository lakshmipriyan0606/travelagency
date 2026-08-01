/**
 * Lightweight User-Agent parser — no external dependency.
 * Good enough for dashboard device/browser/OS breakdowns.
 */

function matchVersion(ua, pattern) {
  const m = ua.match(pattern);
  return m?.[1] || '';
}

export function parseUserAgent(ua = '') {
  const s = String(ua || '');
  if (!s || s === 'Unknown') {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      deviceType: 'unknown',
    };
  }

  let browser = 'Unknown';
  let browserVersion = '';
  if (/Edg\//i.test(s)) {
    browser = 'Edge';
    browserVersion = matchVersion(s, /Edg\/([\d.]+)/i);
  } else if (/OPR\/|Opera/i.test(s)) {
    browser = 'Opera';
    browserVersion = matchVersion(s, /(?:OPR|Opera)\/([\d.]+)/i);
  } else if (/Chrome\//i.test(s)) {
    browser = 'Chrome';
    browserVersion = matchVersion(s, /Chrome\/([\d.]+)/i);
  } else if (/Firefox\//i.test(s)) {
    browser = 'Firefox';
    browserVersion = matchVersion(s, /Firefox\/([\d.]+)/i);
  } else if (/Safari\//i.test(s) && !/Chrome/i.test(s)) {
    browser = 'Safari';
    browserVersion = matchVersion(s, /Version\/([\d.]+)/i);
  } else if (/MSIE|Trident/i.test(s)) {
    browser = 'IE';
    browserVersion = matchVersion(s, /(?:MSIE |rv:)([\d.]+)/i);
  }

  let os = 'Unknown';
  let osVersion = '';
  if (/Windows NT 10/i.test(s)) {
    os = 'Windows';
    osVersion = '10/11';
  } else if (/Windows NT 6\.3/i.test(s)) {
    os = 'Windows';
    osVersion = '8.1';
  } else if (/Windows NT 6\.1/i.test(s)) {
    os = 'Windows';
    osVersion = '7';
  } else if (/Mac OS X ([\d_]+)/i.test(s)) {
    os = 'macOS';
    osVersion = matchVersion(s, /Mac OS X ([\d_]+)/i).replace(/_/g, '.');
  } else if (/Android ([\d.]+)/i.test(s)) {
    os = 'Android';
    osVersion = matchVersion(s, /Android ([\d.]+)/i);
  } else if (/iPhone OS ([\d_]+)|iPad.*OS ([\d_]+)/i.test(s)) {
    os = 'iOS';
    const m = s.match(/OS ([\d_]+)/i);
    osVersion = m?.[1]?.replace(/_/g, '.') || '';
  } else if (/Linux/i.test(s)) {
    os = 'Linux';
  } else if (/CrOS/i.test(s)) {
    os = 'ChromeOS';
  }

  let deviceType = 'desktop';
  if (/iPad|Tablet|PlayBook/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s))) {
    deviceType = 'tablet';
  } else if (/Mobile|iPhone|Android.*Mobile|webOS|BlackBerry|IEMobile/i.test(s)) {
    deviceType = 'mobile';
  }

  return { browser, browserVersion, os, osVersion, deviceType };
}

/** Pull country/region/city from common CDN / edge proxy headers when present. */
export function extractGeoFromHeaders(headers = {}) {
  const h = headers || {};
  const country =
    h['cf-ipcountry'] ||
    h['x-vercel-ip-country'] ||
    h['x-country-code'] ||
    h['cloudfront-viewer-country'] ||
    '';
  const region = h['x-vercel-ip-country-region'] || h['cf-region'] || h['x-region'] || '';
  const city = h['x-vercel-ip-city'] || h['cf-ipcity'] || h['x-city'] || '';

  return {
    country: String(country || '').trim(),
    region: decodeURIComponent(String(region || '').trim()),
    city: decodeURIComponent(String(city || '').trim()),
  };
}

const MAX_PAGE_VIEWS = 50;

export function clampPageViews(views = []) {
  if (!Array.isArray(views)) return [];
  return views.slice(-MAX_PAGE_VIEWS);
}
