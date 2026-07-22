import express from 'express';
import { protectRoute } from '#middleware/auth/auth.middleware.js';
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
  swapOrder,
  moveReview,
  normalizeReviewsOrder,
} from './review.controller.js';

// Public routes

// Protected routes (Admin only)

const router = express.Router();

router.get('/', getAllReviews);

export default router;
