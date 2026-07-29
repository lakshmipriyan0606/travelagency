import { rateLimit } from 'express-rate-limit';

/**
 * Rate Limiter for B2B login attempts.
 * Limit: 5 failed attempts / 15 minutes per IP + email combination.
 * Skipped for general test cases, but active for specific rate-limit validation tests.
 */
export const b2bLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Disables all express-rate-limit validation warnings/errors
  message: {
    success: false,
    message: 'Too many failed login attempts. Please try again after 15 minutes.',
  },
  keyGenerator: (req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : 'anonymous';
    return `${ip}:${email}`;
  },
  skipSuccessfulRequests: true, // Only count failed attempts (non-2xx responses)
  skip: (req) => {
    if (process.env.NODE_ENV !== 'test') return false;
    // In test environment, skip rate limiting for all requests except the specific test case
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    return email !== 'badagent@testtravels.com';
  },
});
