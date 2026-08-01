import express from 'express';
import {
  getDailyVisits,
  getDailyVisitDetails,
  getVisitorOverview,
  getVisitorDistribution,
  getRecentVisitors,
  getVisitorProfile,
  cleanupLocalhostVisits,
} from './analytics.controller.js';
import { protectRoute, adminOnly } from '#b2c/middleware/auth.middleware.js';

const router = express.Router();

// Visitor / traffic analytics only — API monitoring lives in /api/v1/devops
router.get('/daily', protectRoute, adminOnly, getDailyVisits);
router.get('/overview', protectRoute, adminOnly, getVisitorOverview);
router.get('/distribution', protectRoute, adminOnly, getVisitorDistribution);
router.get('/visitors', protectRoute, adminOnly, getRecentVisitors);
router.delete('/visitors/localhost', protectRoute, adminOnly, cleanupLocalhostVisits);
router.get('/visitors/:visitorId', protectRoute, adminOnly, getVisitorProfile);
router.get('/daily/:date', protectRoute, adminOnly, getDailyVisitDetails);

export default router;
