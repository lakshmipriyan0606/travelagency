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
import { protectRoute } from '#b2c/middleware/auth.middleware.js';
import { upload } from '#config/multer.js';
import { cacheResponse, bustCacheByPrefix } from '#shared/middleware/cache.middleware.js';

// Public routes

// Admin routes (Protected)

const router = express.Router();

router.get(
  '/',
  cacheResponse((req) => `blogs:list:${JSON.stringify(req.query)}`, 300),
  getAllBlogs
);
router.get(
  '/:slug',
  cacheResponse((req) => `blogs:slug:${req.params.slug}`, 300),
  getBlogBySlug
);
router.post(
  '/:id/like',
  (req, res, next) => {
    bustCacheByPrefix('blogs:');
    next();
  },
  toggleLike
);

export default router;
