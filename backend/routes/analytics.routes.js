import express from "express";
import {
  recordVisit,
  getDailyVisits,
  getApiUsage,
  cleanupLocalhostVisits,
} from "../controllers/analytics.controller.js";
import { protectRoute, superAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/visit", recordVisit);

router.get("/daily", protectRoute, superAdminOnly, getDailyVisits);
router.get("/api-usage", protectRoute, superAdminOnly, getApiUsage);
router.delete("/visitors/localhost", protectRoute, superAdminOnly, cleanupLocalhostVisits);

export default router;
