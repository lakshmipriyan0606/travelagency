import express from "express";
import { recordVisit, getDailyVisits } from "../controllers/analytics.controller.js";
import { protectRoute, superAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route to record a visit
router.post("/visit", recordVisit);

// Protected route for dashboard
router.get("/daily", protectRoute, superAdminOnly, getDailyVisits);

export default router;
