import express from 'express';
import { protectRoute } from '#b2c/middleware/auth.middleware.js';
import {
  createStory,
  getAllStories,
  deleteStory,
  moveStory,
  normalizeStoriesOrder,
} from './story.controller.js';

const router = express.Router();

// Public route
router.get('/', getAllStories);

// Admin routes
router.post('/', protectRoute, createStory);
router.delete('/:id', protectRoute, deleteStory);
router.post('/:id/move', protectRoute, moveStory);
router.post('/normalize', protectRoute, normalizeStoriesOrder);

export default router;
