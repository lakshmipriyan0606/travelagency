import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike,
} from "../controllers/blog.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import { cacheResponse, bustCacheByPrefix } from "../middlewares/cache.middleware.js";

const router = express.Router();

// Public routes
router.get("/", cacheResponse((req) => `blogs:list:${JSON.stringify(req.query)}`, 300), getAllBlogs);
router.get("/:slug", cacheResponse((req) => `blogs:slug:${req.params.slug}`, 300), getBlogBySlug);
router.post("/:id/like", (req, res, next) => { bustCacheByPrefix("blogs:"); next(); }, toggleLike);

// Admin routes (Protected)
router.get("/admin/:id", protectRoute, getBlogById);
router.post(
  "/",
  protectRoute,
  upload.any(),
  (req, res, next) => { bustCacheByPrefix("blogs:"); next(); },
  createBlog
);
router.put(
  "/:id",
  protectRoute,
  upload.any(),
  (req, res, next) => { bustCacheByPrefix("blogs:"); next(); },
  updateBlog
);
router.delete("/:id", protectRoute, (req, res, next) => { bustCacheByPrefix("blogs:"); next(); }, deleteBlog);

export default router;
