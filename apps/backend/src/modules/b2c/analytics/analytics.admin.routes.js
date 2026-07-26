import express from 'express';
import {
  recordVisit,
  getDailyVisits,
  getApiUsage,
  cleanupLocalhostVisits,
} from './analytics.controller.js';
import { protectRoute, superAdminOnly } from '#middleware/auth/auth.middleware.js';

const router = express.Router();

router.get('/daily', protectRoute, superAdminOnly, getDailyVisits);
router.get('/api-usage', protectRoute, superAdminOnly, getApiUsage);
router.delete('/visitors/localhost', protectRoute, superAdminOnly, cleanupLocalhostVisits);

export default router;
