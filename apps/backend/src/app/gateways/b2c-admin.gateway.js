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
import analyticsRoutes from '#modules/analytics/analytics.admin.routes.js';
import authRoutes from '#modules/auth/auth.b2c.routes.js';
import blogRoutes from '#modules/blogs/blog.admin.routes.js';
import destinationRoutes from '#modules/destinations/destination.admin.routes.js';
import packageRoutes from '#modules/packages/package.admin.routes.js';
import reviewRoutes from '#modules/reviews/review.admin.routes.js';
import uiConfigRoutes from '#modules/uiConfig/uiConfig.admin.routes.js';
import uploadRoutes from '#modules/upload/upload.admin.routes.js';
import usersRoutes from '#modules/users/users.admin.routes.js';
import websiteHeroRoutes from '#modules/websiteHero/websiteHero.admin.routes.js';

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

export default router;
