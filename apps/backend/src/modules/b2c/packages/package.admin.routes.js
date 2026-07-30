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

// Admin list/read — must be registered before /:id
router.get('/', protectRoute, adminOnly, (req, res, next) => {
  req.query.isAdmin = 'true';
  next();
}, getAllPackages);
router.get('/takenRanks', protectRoute, adminOnly, getTakenRanks);
router.get('/:id', protectRoute, adminOnly, getPackageById);

router.post(
  '/create',
  protectRoute,
  adminOnly,
  upload.any(),
  (req, res, next) => {
    bustCacheByPrefix('packages:');
    next();
  },
  createPackage
);
router.post(
  '/updatePackage/:id',
  protectRoute,
  adminOnly,
  upload.any(),
  (req, res, next) => {
    bustCacheByPrefix('packages:');
    next();
  },
  updatePackage
);
router.patch(
  '/updateRank/:id',
  protectRoute,
  adminOnly,
  (req, res, next) => {
    bustCacheByPrefix('packages:');
    next();
  },
  updateRank
);
router.patch(
  '/toggleStatus/:id',
  protectRoute,
  adminOnly,
  (req, res, next) => {
    bustCacheByPrefix('packages:');
    next();
  },
  toggleStatus
);
router.delete(
  '/deletePackage/:id',
  protectRoute,
  adminOnly,
  (req, res, next) => {
    bustCacheByPrefix('packages:');
    next();
  },
  deletePackage
);
router.post('/sync-from-sheet', protectRoute, adminOnly, syncFromSheet);

export default router;
