import express from 'express';
import {
  recordVisit,
  getDailyVisits,
  getApiUsage,
  cleanupLocalhostVisits,
} from './analytics.controller.js';
import { protectRoute, adminOnly } from '#b2c/middleware/auth.middleware.js';

const router = express.Router();

router.get('/daily', protectRoute, adminOnly, getDailyVisits);
router.get('/api-usage', protectRoute, adminOnly, getApiUsage);
router.delete('/visitors/localhost', protectRoute, adminOnly, cleanupLocalhostVisits);

export default router;
