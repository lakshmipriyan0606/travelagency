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

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/:id/like", toggleLike);

// Admin routes (Protected)
router.get("/admin/:id", protectRoute, getBlogById);
router.post(
  "/",
  protectRoute,
  upload.any(), // Accept fields & multiple optional files like thumbnailImage and bannerImage
  createBlog
);
router.put(
  "/:id",
  protectRoute,
  upload.any(),
  updateBlog
);
router.delete("/:id", protectRoute, deleteBlog);

export default router;
