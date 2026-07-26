import express from 'express';
import { protectRoute } from '#b2c/middleware/auth.middleware.js';
import { cacheResponse } from '#shared/middleware/cache.middleware.js';
import {
  createDestination,
  getAllDestinations,
  updateDestination,
  deleteDestination,
  moveDestination,
  normalizeDestinationsOrder,
} from './destination.controller.js';

// Public routes

// Protected routes (Admin only)

const router = express.Router();

router.get('/', cacheResponse('destinations', 3600), getAllDestinations);

export default router;
