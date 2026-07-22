/**
 * ============================================================================
 * Health Check Routes
 * ============================================================================
 *
 * Layer:
 * Infrastructure / Monitoring
 *
 * Responsibility:
 * Exposes endpoints to Kubernetes or load balancers to determine if the
 * application is alive and ready to serve traffic. Checks DB connectivity
 * and provides system metrics (uptime, memory, cpu).
 *
 * Called By:
 * src/app/registerRoutes.js
 * ============================================================================
 */
import express from 'express';
import mongoose from 'mongoose';
import { getQueuePublicSnapshot } from '#config/queueRuntime.js';

const router = express.Router();

// ── Health Check ──────────────────────────────────────────────────────
router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

router.get('/health/ready', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  if (!isMongoConnected) {
    return res.status(503).json({ status: 'unavailable', reason: 'Database not connected' });
  }
  res.status(200).json({ status: 'ready' });
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime().toFixed(2) + 's',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    appVersion: process.env.npm_package_version || 'unknown',
    env: process.env.NODE_ENV || 'development',
    queue: getQueuePublicSnapshot(),
    dbState: mongoose.connection.readyState,
  });
});

export default router;
