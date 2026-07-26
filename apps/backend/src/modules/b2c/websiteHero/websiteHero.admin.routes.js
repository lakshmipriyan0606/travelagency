import express from 'express';
import { protectRoute, adminOnly } from '#b2c/middleware/auth.middleware.js';
import {
  getActiveHero,
  getAllHeroes,
  createHero,
  updateHero,
  deleteHero,
} from './websiteHero.controller.js';

// Public: get active hero

// Admin: manage hero cards

const router = express.Router();

router.get('/', protectRoute, adminOnly, getAllHeroes);
router.post('/', protectRoute, adminOnly, createHero);
router.put('/:id', protectRoute, adminOnly, updateHero);
router.delete('/:id', protectRoute, adminOnly, deleteHero);

export default router;
