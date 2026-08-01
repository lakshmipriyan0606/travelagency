/**
 * P2–P10 DevOps observability routes (API rollups → Alert Center).
 */
import express from 'express';
import { sendSuccess } from '#shared/utils/response.js';
import { devopsSessionChain, devopsCsrf } from '../middleware/devopsAuth.middleware.js';
import { getObservabilitySummary, runMetricRollup } from '../services/rollup.service.js';
import { getBusinessSummary } from '../services/business.service.js';
import { getTrafficSummary } from '../services/traffic.service.js';
import { getSecurityOpsSummary } from '../services/securityOps.service.js';
import { getQueueMonitorSummary } from '../services/queueMonitor.service.js';
import { getDeploySummary } from '../services/deploy.service.js';
import { listAuditLogs, writeAudit } from '../services/audit.service.js';
import { getUnifiedAlerts, updateAlertStatus } from '../services/alert.service.js';
import { clientIp } from '../services/devopsCrypto.service.js';

const router = express.Router();

/** P2 — API observability rollups */
router.get('/api/observability', ...devopsSessionChain, async (req, res) => {
  const data = await getObservabilitySummary({
    from: req.query.from,
    to: req.query.to,
  });
  return sendSuccess(res, 200, 'API observability', { data });
});

router.post('/api/observability/rollup', ...devopsSessionChain, devopsCsrf, async (req, res) => {
  const data = await runMetricRollup({ force: Boolean(req.body?.force) });
  await writeAudit({
    actorUserId: req.user._id,
    action: 'devops.api.rollup',
    ip: clientIp(req),
    deviceId: req.devopsSession?.deviceId,
    meta: { force: Boolean(req.body?.force) },
  });
  return sendSuccess(res, 200, 'Metric rollup', { data });
});

/** P4 — Business */
router.get('/business/summary', ...devopsSessionChain, async (_req, res) => {
  const data = await getBusinessSummary();
  return sendSuccess(res, 200, 'Business monitoring', { data });
});

/** P5 — Traffic / visitor analytics bridge */
router.get('/traffic/summary', ...devopsSessionChain, async (req, res) => {
  const data = await getTrafficSummary({ days: req.query.days });
  return sendSuccess(res, 200, 'Traffic summary', { data });
});

/** P6 — Security ops */
router.get('/security/summary', ...devopsSessionChain, async (req, res) => {
  const data = await getSecurityOpsSummary({
    from: req.query.from,
    to: req.query.to,
    limit: req.query.limit,
  });
  return sendSuccess(res, 200, 'Security operations', { data });
});

/** P7 — Queues */
router.get('/queues/summary', ...devopsSessionChain, async (_req, res) => {
  const data = await getQueueMonitorSummary();
  return sendSuccess(res, 200, 'Queue monitoring', { data });
});

/** P8 — Deploy / runtime identity */
router.get('/deploy/summary', ...devopsSessionChain, async (_req, res) => {
  const data = await getDeploySummary();
  return sendSuccess(res, 200, 'Deploy summary', { data });
});

/** P9 — Audit trail */
router.get('/audit/logs', ...devopsSessionChain, async (req, res) => {
  const data = await listAuditLogs(req.query);
  return sendSuccess(res, 200, 'Audit logs', { data });
});

/** P10 — Alert Center */
router.get('/alerts', ...devopsSessionChain, async (req, res) => {
  const data = await getUnifiedAlerts({ status: req.query.status || 'open' });
  return sendSuccess(res, 200, 'Alert center', { data });
});

router.patch('/alerts/:fingerprint', ...devopsSessionChain, devopsCsrf, async (req, res) => {
  const status = req.body?.status;
  if (!['open', 'ack', 'resolved'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const data = await updateAlertStatus(req.params.fingerprint, status);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  await writeAudit({
    actorUserId: req.user._id,
    action: 'devops.alerts.update',
    ip: clientIp(req),
    deviceId: req.devopsSession?.deviceId,
    meta: { fingerprint: req.params.fingerprint, status },
  });
  return sendSuccess(res, 200, 'Alert updated', { data });
});

export default router;
