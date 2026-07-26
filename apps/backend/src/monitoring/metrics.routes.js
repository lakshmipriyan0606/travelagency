/**
 * ============================================================================
 * Metrics Routes
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Monitoring
 *
 * Responsibility:
 * Exposes Prometheus formatted metrics for automated scraping, as well as
 * JSON formatted metrics for the custom Admin Dashboard. Protected by a
 * static token or superadmin session.
 *
 * Called By:
 * src/app/registerRoutes.js
 * ============================================================================
 */
import express from 'express';
import { register } from '#config/metrics.js';
import { protectRoute, superAdminOnly } from '#b2c/middleware/auth.middleware.js';
import { logger } from '#shared/utils/logger.js';

const router = express.Router();

// ── Metrics Endpoint (Prometheus) ─────────────────────────────────────
router.get('/metrics', async (req, res) => {
  const token = req.headers['x-metrics-token'];
  if (process.env.METRICS_TOKEN && token !== process.env.METRICS_TOKEN) {
    return res.status(403).json({ message: 'Forbidden: Invalid metrics token' });
  }
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ── Metrics Endpoint (JSON for Admin Panel) ───────────────────────────
router.get(
  '/api/admin/metrics',
  async (req, res, next) => {
    // Allow either:
    // - token-based access (recommended for pulling production metrics into a separately hosted admin UI)
    // - OR authenticated superadmin session (cookie)
    const token = req.headers['x-metrics-token'];
    if (process.env.METRICS_TOKEN && token === process.env.METRICS_TOKEN) {
      return next();
    }
    return protectRoute(req, res, () => superAdminOnly(req, res, next));
  },
  async (req, res) => {
    try {
      const metrics = await register.getMetricsAsJSON();
      res.status(200).json(metrics);
    } catch (error) {
      logger.error({ error }, 'Error fetching metrics');
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  }
);

export default router;
