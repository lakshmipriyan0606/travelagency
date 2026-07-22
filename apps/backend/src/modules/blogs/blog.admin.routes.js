import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike,
} from './blog.controller.js';
import { protectRoute } from '#middleware/auth/auth.middleware.js';
import { upload } from '#config/multer.js';
import { cacheResponse, bustCacheByPrefix } from '#middleware/cache.middleware.js';

// Public routes

// Admin routes (Protected)

const router = express.Router();

router.get('/admin/:id', protectRoute, getBlogById);
router.post(
  '/',
  protectRoute,
  upload.any(),
  (req, res, next) => {
    bustCacheByPrefix('blogs:');
    next();
  },
  createBlog
);
router.put(
  '/:id',
  protectRoute,
  upload.any(),
  (req, res, next) => {
    bustCacheByPrefix('blogs:');
    next();
  },
  updateBlog
);
router.delete(
  '/:id',
  protectRoute,
  (req, res, next) => {
    bustCacheByPrefix('blogs:');
    next();
  },
  deleteBlog
);

export default router;
