import express from "express";
import { protectRoute, superAdminOnly } from "../middlewares/auth.middleware.js";
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
  swapOrder,
  moveReview,
  normalizeReviewsOrder,
} from "../controllers/review.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllReviews);

// Protected routes (Admin only)
router.post("/", protectRoute, createReview);
router.put("/:id", protectRoute, updateReview);
router.delete("/:id", protectRoute, deleteReview);
router.post("/swap", protectRoute, swapOrder);
router.post("/:id/move", protectRoute, moveReview);
router.post("/normalize", protectRoute, normalizeReviewsOrder);

export default router;
