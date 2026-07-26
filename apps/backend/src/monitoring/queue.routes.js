/**
 * ============================================================================
 * Background Queue Health Routes
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Monitoring
 *
 * Responsibility:
 * Exposes an endpoint to inspect the health and state of the Agenda background
 * worker. Protected by a static metrics token or a superadmin session.
 *
 * Called By:
 * src/app/registerRoutes.js
 * ============================================================================
 */
import express from 'express';
import { getQueueHealthDetail } from '#config/queueRuntime.js';
import { protectRoute, superAdminOnly } from '#b2c/middleware/auth.middleware.js';
import { logger } from '#shared/utils/logger.js';

const router = express.Router();

// ── Agenda / booking queue health (admin or metrics token) ───────────
router.get(
  '/api/admin/queue/health',
  async (req, res, next) => {
    const token = req.headers['x-metrics-token'];
    if (process.env.METRICS_TOKEN && token === process.env.METRICS_TOKEN) {
      return next();
    }
    return protectRoute(req, res, () => superAdminOnly(req, res, next));
  },
  async (req, res) => {
    try {
      const detail = await getQueueHealthDetail();
      const healthy =
        detail.mongoConnected && detail.agendaWorkerStarted && typeof detail.note !== 'string';
      res.status(200).json({
        healthy,
        ...detail,
        hints: {
          ifAgendaWorkerFalse:
            'Server did not finish agenda.start(); check deploy/restart and server logs.',
          ifRecentFailures:
            'See recentFailures.reason — common fix: update Agenda job define() order (handler before options).',
          ifMongoFalse: 'Check MONGO_URI and Atlas network access.',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Queue health error');
      res.status(500).json({
        healthy: false,
        message: error.message || 'Failed to read queue health',
      });
    }
  }
);

export default router;
