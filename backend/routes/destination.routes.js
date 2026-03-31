import express from "express";
import { protectRoute, superAdminOnly } from "../middlewares/auth.middleware.js";
import {
  createDestination,
  getAllDestinations,
  updateDestination,
  deleteDestination,
  moveDestination,
  normalizeDestinationsOrder,
} from "../controllers/destination.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllDestinations);

// Protected routes (Admin only)
router.post("/", protectRoute, createDestination);
router.put("/:id", protectRoute, updateDestination);
router.delete("/:id", protectRoute, deleteDestination);
router.post("/:id/move", protectRoute, moveDestination);
router.post("/normalize", protectRoute, normalizeDestinationsOrder);

export default router;
