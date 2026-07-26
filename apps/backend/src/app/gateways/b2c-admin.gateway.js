/**
 * ============================================================================
 * Application Gateway: B2C Admin
 * ============================================================================
 *
 * Layer:
 * Routing / Gateway
 *
 * Responsibility:
 * Exposes the protected API endpoints intended for administrators.
 * It aggregates the Admin-specific routes from various feature modules.
 * Protected by global rate limiters and authentication middleware upstream.
 *
 * Called By:
 * src/app/registerRoutes.js
 *
 * Depends On:
 * Feature Modules (*.admin.routes.js)
 * ============================================================================
 */
import express from 'express';
import analyticsRoutes from '#b2c/analytics/analytics.admin.routes.js';
import authRoutes from '#b2c/auth/auth.b2c.routes.js';
import blogRoutes from '#b2c/blogs/blog.admin.routes.js';
import destinationRoutes from '#b2c/destinations/destination.admin.routes.js';
import packageRoutes from '#b2c/packages/package.admin.routes.js';
import reviewRoutes from '#b2c/reviews/review.admin.routes.js';
import uiConfigRoutes from '#b2c/uiConfig/uiConfig.admin.routes.js';
import uploadRoutes from '#b2c/upload/upload.admin.routes.js';
import usersRoutes from '#b2c/users/users.admin.routes.js';
import websiteHeroRoutes from '#b2c/websiteHero/websiteHero.admin.routes.js';
import storyRoutes from '#b2c/stories/story.routes.js';

const router = express.Router();

router.use('/analytics', analyticsRoutes);
router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/destinations', destinationRoutes);
router.use('/packages', packageRoutes);
router.use('/reviews', reviewRoutes);
router.use('/ui-config', uiConfigRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', usersRoutes);
router.use('/website-hero', websiteHeroRoutes);
router.use('/stories', storyRoutes);

export default router;
