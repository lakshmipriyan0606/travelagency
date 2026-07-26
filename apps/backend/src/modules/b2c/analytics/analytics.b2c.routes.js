import express from 'express';
import {
  recordVisit,
  getDailyVisits,
  getApiUsage,
  cleanupLocalhostVisits,
} from './analytics.controller.js';
import { protectRoute, superAdminOnly } from '#b2c/middleware/auth.middleware.js';

const router = express.Router();

router.post('/visit', recordVisit);

export default router;
