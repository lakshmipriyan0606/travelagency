/**
 * ============================================================================
 * Application Gateway: B2C (Business to Consumer)
 * ============================================================================
 *
 * Layer:
 * Routing / Gateway
 *
 * Responsibility:
 * Exposes the public API endpoints intended for end-users (consumers).
 * It aggregates the B2C-specific routes from various feature modules.
 * Ensures no administrative or privileged routes leak into the public API space.
 *
 * Called By:
 * src/app/registerRoutes.js
 *
 * Depends On:
 * Feature Modules (*.b2c.routes.js)
 * ============================================================================
 */
import express from 'express';
import analyticsRoutes from '#modules/b2c/analytics/analytics.b2c.routes.js';
import authRoutes from '#modules/b2c/auth/auth.b2c.routes.js';
import blogRoutes from '#modules/b2c/blogs/blog.b2c.routes.js';
import bookingRoutes from '#modules/b2c/bookings/booking.b2c.routes.js';
import destinationRoutes from '#modules/b2c/destinations/destination.b2c.routes.js';
import newsletterRoutes from '#modules/b2c/newsletter/newsletter.b2c.routes.js';
import packageRoutes from '#modules/b2c/packages/package.b2c.routes.js';
import reviewRoutes from '#modules/b2c/reviews/review.b2c.routes.js';
import uiConfigRoutes from '#modules/b2c/uiConfig/uiConfig.b2c.routes.js';
import websiteHeroRoutes from '#modules/b2c/websiteHero/websiteHero.b2c.routes.js';
import storyRoutes from '#modules/b2c/stories/story.routes.js';

import { apiLimiter } from '#middleware/rateLimiter.middleware.js';

const router = express.Router();

router.use('/analytics', apiLimiter, analyticsRoutes);
router.use('/auth', authRoutes);
router.use('/blogs', apiLimiter, blogRoutes);
router.use('/bookings', apiLimiter, bookingRoutes);
router.use('/destinations', apiLimiter, destinationRoutes);
router.use('/newsletter', apiLimiter, newsletterRoutes);
router.use('/packages', apiLimiter, packageRoutes);
router.use('/reviews', apiLimiter, reviewRoutes);
router.use('/ui-config', apiLimiter, uiConfigRoutes);
router.use('/website-hero', apiLimiter, websiteHeroRoutes);
router.use('/stories', apiLimiter, storyRoutes);

export default router;
