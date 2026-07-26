import express from 'express';
import { protectRoute, adminOnly } from '#b2c/middleware/auth.middleware.js';
import { getWebsiteHero, updateWebsiteHero } from './uiConfig.controller.js';

const router = express.Router();

router.get('/website-hero', getWebsiteHero);

export default router;
