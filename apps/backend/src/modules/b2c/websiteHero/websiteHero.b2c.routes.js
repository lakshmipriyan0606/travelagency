import express from 'express';
import { protectRoute, adminOnly } from '#middleware/auth/auth.middleware.js';
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

router.get('/active', getActiveHero);

export default router;
