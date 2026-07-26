import express from 'express';
import { protectRoute } from '#b2c/middleware/auth.middleware.js';
import { cacheResponse } from '#shared/middleware/cache.middleware.js';
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
