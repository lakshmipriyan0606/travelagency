import express from 'express';
import { sendSuccess } from '#shared/utils/response.js';
import { devopsSessionChain } from '../middleware/devopsAuth.middleware.js';
import {
  getCapacityAlerts,
  getCapacityApps,
  getCapacityCloud,
  getCapacityCollections,
  getCapacityDisk,
  getCapacityForecast,
  getCapacityMemory,
  getCapacityMongodb,
  getCapacityOverview,
} from '../services/capacity.service.js';

const router = express.Router();

function freshOpts(req) {
  return { force: req.query.fresh === '1' || req.query.fresh === 'true' };
}

router.get('/capacity/overview', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityOverview(freshOpts(req));
  return sendSuccess(res, 200, 'Capacity overview', { data });
});

router.get('/capacity/mongodb', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityMongodb(freshOpts(req));
  return sendSuccess(res, 200, 'MongoDB capacity', { data });
});

router.get('/capacity/collections', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityCollections(freshOpts(req));
  return sendSuccess(res, 200, 'Collection analytics', { data });
});

router.get('/capacity/disk', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityDisk(freshOpts(req));
  return sendSuccess(res, 200, 'Disk capacity', { data });
});

router.get('/capacity/memory', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityMemory(freshOpts(req));
  return sendSuccess(res, 200, 'Memory capacity', { data });
});

router.get('/capacity/forecast', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityForecast(freshOpts(req));
  return sendSuccess(res, 200, 'Capacity forecast', { data });
});

router.get('/capacity/alerts', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityAlerts(freshOpts(req));
  return sendSuccess(res, 200, 'Capacity alerts', { data });
});

router.get('/capacity/apps', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityApps(freshOpts(req));
  return sendSuccess(res, 200, 'App storage breakdown', { data });
});

router.get('/capacity/cloud', ...devopsSessionChain, async (req, res) => {
  const data = await getCapacityCloud(freshOpts(req));
  return sendSuccess(res, 200, 'Cloud storage', { data });
});

export default router;
