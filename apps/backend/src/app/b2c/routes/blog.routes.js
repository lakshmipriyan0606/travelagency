import express from "express";
import { cacheResponse, bustCacheByPrefix } from "../../../middlewares/cache.middleware.js";
import { getAllBlogs, getBlogBySlug, toggleLike } from "../../../modules/blogs/blog.controller.js";

const router = express.Router();

router.get("/", cacheResponse((req) => `blogs:list:${JSON.stringify(req.query)}`, 300), getAllBlogs);
router.get("/:slug", cacheResponse((req) => `blogs:slug:${req.params.slug}`, 300), getBlogBySlug);
router.post("/:id/like", (req, res, next) => { bustCacheByPrefix("blogs:"); next(); }, toggleLike);

export default router;
