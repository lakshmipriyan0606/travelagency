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

router.post('/', protectRoute, createReview);
router.put('/:id', protectRoute, updateReview);
router.delete('/:id', protectRoute, deleteReview);
router.post('/swap', protectRoute, swapOrder);
router.post('/:id/move', protectRoute, moveReview);
router.post('/normalize', protectRoute, normalizeReviewsOrder);

export default router;
