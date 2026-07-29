/**
 * ============================================================================
 * RATE LIMITER MIDDLEWARE CONFIGURATION
 *
 * Implements security limits across different route namespaces to prevent DOS,
 * credential stuffing, and api scraper bots.
 * ============================================================================
 */
import { rateLimit } from 'express-rate-limit';

const rateLimitResponse = (message) => ({
  message,
  retryAfter: '15 minutes',
});

// Skip helper for test execution context
const isTestEnv = () => process.env.NODE_ENV === 'test';

// ── 1. Global Limiter — applies to all routes ────────────────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many requests. Please try again in 15 minutes.'),
  skip: isTestEnv,
});

// ── 2. Auth Limiter — strict for login / register attempts ───────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many login attempts. Please wait 15 minutes.'),
  skipSuccessfulRequests: true, // Only count failed attempts
  skip: isTestEnv,
});

// ── 3. API Limiter — public packages & blogs endpoints ───────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('API rate limit exceeded. Please slow down.'),
  skip: isTestEnv,
});

// ── 4. Booking Limiter — prevent spam form submissions ───────────────
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many booking submissions. Please try again in an hour.'),
  skip: isTestEnv,
});
