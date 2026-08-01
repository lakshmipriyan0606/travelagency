/**
 * ============================================================================
 * Request Origin Utilities
 * ============================================================================
 *
 * Layer:
 * Shared Utility
 *
 * Responsibility:
 * Helper functions for IP address extraction, network environment detection
 * (local vs public), and data sanitization (IP masking for analytics).
 * Used heavily by the analytics module to filter out developer traffic.
 *
 * Called By:
 * src/modules/analytics/analytics.service.js
 * src/middleware/prometheus.js
 * ============================================================================
 */
const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1|::1/i;
const PRIVATE_IP_PATTERN =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;

function isPrivateIp(ip) {
  if (!ip || ip === 'Unknown') return false;
  const normalized = ip.replace(/^::ffff:/, '');
  if (LOCALHOST_PATTERN.test(normalized)) return true;
  return PRIVATE_IP_PATTERN.test(normalized);
}

function isLocalString(value) {
  if (!value) return false;
  return LOCALHOST_PATTERN.test(value);
}

/**
 * Extracts the true client IP address, safely checking proxy headers first.
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = forwarded.toString().split(',')[0].trim();
    if (first) return first;
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'Unknown';
}

/**
 * Determines if a request originated from the local development environment.
 */
export function isLocalRequest(req) {
  const origin = (req.headers.origin || '').toString();
  const referer = (req.headers.referer || '').toString();
  const host = (req.headers.host || '').toString();
  const ip = getClientIp(req);

  return isLocalString(origin) || isLocalString(referer) || isLocalString(host) || isPrivateIp(ip);
}

/**
 * Sanitizes IP addresses for storage/display by masking the final octets.
 * Preserves privacy while still allowing geographical grouping if needed.
 */
export function maskIp(ip) {
  if (!ip || ip === 'Unknown') return 'Unknown';
  const normalized = ip.replace(/^::ffff:/, '');
  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    if (parts.length > 2) {
      return `${parts.slice(0, 3).join(':')}:xxxx`;
    }
    return normalized;
  }
  const octets = normalized.split('.');
  if (octets.length === 4) {
    return `${octets[0]}.${octets[1]}.xx.xx`;
  }
  return normalized;
}

export function getUtcDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function getFullPath(req) {
  return (req.originalUrl || '').split('?')[0] || req.path || '';
}

export function isAnalyticsApiPath(path) {
  // Legacy mount + current versioned gateways
  return (
    path.startsWith('/api/analytics') ||
    path.startsWith('/api/v1/b2c/analytics') ||
    path.startsWith('/api/v1/b2c-admin/analytics') ||
    /\/analytics(\/|$)/.test(path)
  );
}

/**
 * Filters out internal, admin, and local traffic to identify requests
 * that should be tracked as "public API hits" in the analytics system.
 */
export function isPublicApiRequest(req) {
  const fullPath = getFullPath(req);
  const origin = (req.headers.origin || '').toString();
  const host = (req.headers.host || '').toString();

  const isInternalMetricsPath =
    fullPath === '/metrics' ||
    fullPath === '/health' ||
    fullPath.startsWith('/api/admin/metrics') ||
    fullPath.startsWith('/api/admin/queue');

  // Legacy `/api/admin` + current `/api/v1/b2c-admin`
  const isAdminApi = fullPath.startsWith('/api/admin') || fullPath.startsWith('/api/v1/b2c-admin');
  const isAnalyticsApi = isAnalyticsApiPath(fullPath);

  const isLocalDev =
    /localhost|127\.0\.0\.1/i.test(origin) ||
    /localhost|127\.0\.0\.1/i.test(host) ||
    isLocalRequest(req);

  return !isInternalMetricsPath && !isAdminApi && !isAnalyticsApi && !isLocalDev;
}
