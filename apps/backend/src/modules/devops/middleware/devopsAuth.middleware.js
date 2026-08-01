import { protectRoute, superAdminOnly } from '#b2c/middleware/auth.middleware.js';
import {
  clearDevopsCookies,
  DEVOPS_COOKIE,
  DEVOPS_CSRF_COOKIE,
  loadDevopsSession,
  touchSession,
} from '../services/devopsAuth.service.js';
import { clientIp, ipAllowed } from '../services/devopsCrypto.service.js';
import { writeAudit } from '../services/audit.service.js';

export function devopsNoCache(_req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
}

export function devopsIpAllowlist(req, res, next) {
  const ip = clientIp(req);
  if (!ipAllowed(ip)) {
    writeAudit({
      actorUserId: req.user?._id,
      action: 'devops.ip.denied',
      ip,
      result: 'denied',
      meta: { path: req.originalUrl },
    });
    return res.status(403).json({ success: false, message: 'IP not allowlisted for DevOps' });
  }
  next();
}

export async function requireDevopsSession(req, res, next) {
  try {
    const sessionId = req.cookies?.[DEVOPS_COOKIE];
    const session = await loadDevopsSession(sessionId);
    if (!session) {
      return res.status(401).json({ success: false, message: 'DevOps session required' });
    }
    if (String(session.userId) !== String(req.user._id)) {
      clearDevopsCookies(res);
      return res.status(401).json({ success: false, message: 'DevOps session mismatch' });
    }
    await touchSession(session);
    req.devopsSession = session;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'DevOps session invalid' });
  }
}

export function devopsCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const cookieToken = req.cookies?.[DEVOPS_CSRF_COOKIE];
  const headerToken = req.headers['x-devops-csrf'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ success: false, message: 'CSRF validation failed' });
  }
  if (req.devopsSession && cookieToken !== req.devopsSession.csrfSecret) {
    return res.status(403).json({ success: false, message: 'CSRF session mismatch' });
  }
  next();
}

/** Identity gate for step-up routes: logged-in B2C superadmin + IP */
export const devopsIdentityChain = [protectRoute, superAdminOnly, devopsIpAllowlist, devopsNoCache];

/** Full gate for dashboard APIs */
export const devopsSessionChain = [
  protectRoute,
  superAdminOnly,
  devopsIpAllowlist,
  requireDevopsSession,
  devopsNoCache,
];
