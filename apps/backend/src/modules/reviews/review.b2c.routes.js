import express from 'express';
import { protectRoute } from '#middleware/auth/auth.middleware.js';
import { cacheResponse } from '#middleware/cache.middleware.js';
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

router.get('/', cacheResponse('reviews', 3600), getAllReviews);

export default router;
