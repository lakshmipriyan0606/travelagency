import { rateLimit } from "express-rate-limit";

const rateLimitResponse = (message) => ({
  message,
  retryAfter: "15 minutes",
});

// ── 1. Global Limiter — applies to all routes ────────────────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("Too many requests. Please try again in 15 minutes."),
});

// ── 2. Auth Limiter — strict for login / register attempts ───────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("Too many login attempts. Please wait 15 minutes."),
  skipSuccessfulRequests: true, // Only count failed attempts
});

// ── 3. API Limiter — packages & blogs public endpoints ───────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("API rate limit exceeded. Please slow down."),
});

// ── 4. Booking Limiter — prevent spam form submissions ───────────────
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("Too many booking submissions. Please try again in an hour."),
});
