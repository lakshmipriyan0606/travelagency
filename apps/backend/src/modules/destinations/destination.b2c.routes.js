import express from 'express';
import { protectRoute } from '#middleware/auth/auth.middleware.js';
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

router.get('/', getAllDestinations);

export default router;
