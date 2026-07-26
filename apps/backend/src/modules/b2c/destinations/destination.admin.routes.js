import express from 'express';
import { protectRoute } from '#b2c/middleware/auth.middleware.js';
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

router.post('/', protectRoute, createDestination);
router.put('/:id', protectRoute, updateDestination);
router.delete('/:id', protectRoute, deleteDestination);
router.post('/:id/move', protectRoute, moveDestination);
router.post('/normalize', protectRoute, normalizeDestinationsOrder);

export default router;
