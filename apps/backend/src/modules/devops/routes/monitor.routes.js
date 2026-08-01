import express from 'express';
import { sendSuccess } from '#shared/utils/response.js';
import { devopsSessionChain, devopsCsrf } from '../middleware/devopsAuth.middleware.js';
import {
  getAppsHealth,
  getExecutiveSummary,
  getInfraHealth,
} from '../services/executive.service.js';
import {
  getApiPerformance,
  getErrorDetail,
  listErrors,
  listRequestLogs,
  searchLogs,
  updateErrorStatus,
} from '../services/monitoring.service.js';
import { writeAudit } from '../services/audit.service.js';
import { clientIp } from '../services/devopsCrypto.service.js';

const router = express.Router();

router.get('/executive/summary', ...devopsSessionChain, async (req, res) => {
  const data = await getExecutiveSummary({ from: req.query.from, to: req.query.to });
  return sendSuccess(res, 200, 'Executive summary', { data });
});

router.get('/health/apps', ...devopsSessionChain, async (_req, res) => {
  const data = await getAppsHealth();
  return sendSuccess(res, 200, 'App health', { data });
});

router.get('/health/infra', ...devopsSessionChain, async (_req, res) => {
  const data = await getInfraHealth();
  return sendSuccess(res, 200, 'Infra health', { data });
});

router.get('/api/requests', ...devopsSessionChain, async (req, res) => {
  const data = await listRequestLogs(req.query);
  return sendSuccess(res, 200, 'Request logs', { data });
});

router.get('/api/performance', ...devopsSessionChain, async (req, res) => {
  const data = await getApiPerformance(req.query);
  return sendSuccess(res, 200, 'API performance', { data });
});

router.get('/errors', ...devopsSessionChain, async (req, res) => {
  const data = await listErrors({
    status: req.query.status,
    limit: req.query.limit,
    severity: req.query.severity,
    category: req.query.category,
  });
  return sendSuccess(res, 200, 'Errors', { data });
});

router.get('/errors/:fingerprint', ...devopsSessionChain, async (req, res) => {
  const data = await getErrorDetail(req.params.fingerprint);
  if (!data) return res.status(404).json({ success: false, message: 'Not found' });
  return sendSuccess(res, 200, 'Error detail', { data });
});

router.patch('/errors/:fingerprint', ...devopsSessionChain, devopsCsrf, async (req, res) => {
  const status = req.body?.status;
  if (!['open', 'ack', 'resolved'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const data = await updateErrorStatus(req.params.fingerprint, status);
  await writeAudit({
    actorUserId: req.user._id,
    action: 'devops.errors.update',
    ip: clientIp(req),
    deviceId: req.devopsSession?.deviceId,
    meta: { fingerprint: req.params.fingerprint, status },
  });
  return sendSuccess(res, 200, 'Error updated', { data });
});

router.get('/logs/search', ...devopsSessionChain, async (req, res) => {
  const data = await searchLogs(req.query);
  return sendSuccess(res, 200, 'Log search', { data });
});

router.get('/meta/retention', ...devopsSessionChain, async (_req, res) => {
  return sendSuccess(res, 200, 'Retention', {
    data: {
      presets: ['1h', 'today', '7d', '30d', '90d'],
      requestLogsTtlDays: 14,
      errorEventsTtlDays: 90,
      auditLogsTtlDays: 365,
    },
  });
});

export default router;
