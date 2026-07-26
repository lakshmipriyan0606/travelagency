import express from 'express';
import { protectRoute, adminOnly } from '#b2c/middleware/auth.middleware.js';
import { upload } from '#config/multer.js';
import { cacheResponse, bustCacheByPrefix } from '#shared/middleware/cache.middleware.js';
import {
  createPackage,
  updatePackage,
  getBestPackages,
  getBestActivities,
  getAllPackages,
  getActivityCategories,
  getLikedPackages,
  getLikeCount,
  getSuggestions,
  getTakenRanks,
  getPackageById,
  updateRank,
  toggleStatus,
  deletePackage,
  toggleLike,
  syncFromSheet,
} from './package.controller.js';

const router = express.Router();

router.get(
  '/bestpackages',
  cacheResponse((req) => `packages:best:${req.headers.userid || 'anon'}`, 300),
  getBestPackages
);
router.get(
  '/bestactivities',
  cacheResponse((req) => `packages:bestactivities:${req.headers.userid || 'anon'}`, 300),
  getBestActivities
);
router.get(
  '/',
  cacheResponse(
    (req) => `packages:list:${req.headers.userid || 'anon'}:${JSON.stringify(req.query)}`,
    120
  ),
  getAllPackages
);
router.get(
  '/activitycategories',
  cacheResponse('packages:activitycategories', 600),
  getActivityCategories
);
router.get('/liked', getLikedPackages);
router.get('/likeCount', getLikeCount);
router.get(
  '/suggestions',
  cacheResponse((req) => `packages:suggestions:${req.query.q || ''}`, 60),
  getSuggestions
);
router.get('/takenRanks', getTakenRanks);
router.get('/:id', getPackageById);
router.post('/like', toggleLike);

export default router;
