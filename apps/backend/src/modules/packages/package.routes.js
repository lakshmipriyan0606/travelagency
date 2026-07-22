import express from "express";
import { protectRoute, adminOnly } from "../../middleware/auth/auth.middleware.js";
import { upload } from "../../config/multer.js";
import { cacheResponse, bustCacheByPrefix } from "../../middlewares/cache.middleware.js";
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
  syncFromSheet
} from "./package.controller.js";

const router = express.Router();

router.post(
  "/create",
  protectRoute,
  adminOnly,
  upload.any(),
  (req, res, next) => { bustCacheByPrefix("packages:"); next(); },
  createPackage
);

router.get("/bestpackages", cacheResponse((req) => `packages:best:${req.headers.userid || 'anon'}`, 300), getBestPackages);
router.get("/bestactivities", cacheResponse((req) => `packages:bestactivities:${req.headers.userid || 'anon'}`, 300), getBestActivities);
router.get("/", cacheResponse((req) => `packages:list:${req.headers.userid || 'anon'}:${JSON.stringify(req.query)}`, 120), getAllPackages);
router.get("/activitycategories", cacheResponse("packages:activitycategories", 600), getActivityCategories);
router.get("/liked", getLikedPackages);
router.get("/likeCount", getLikeCount);
router.get("/suggestions", cacheResponse((req) => `packages:suggestions:${req.query.q || ""}`, 60), getSuggestions);
router.get("/takenRanks", getTakenRanks);
router.get("/:id", getPackageById);

router.post(
  "/updatePackage/:id",
  protectRoute,
  adminOnly,
  upload.any(),
  (req, res, next) => { bustCacheByPrefix("packages:"); next(); },
  updatePackage
);

router.patch("/updateRank/:id", protectRoute, adminOnly, (req, res, next) => { bustCacheByPrefix("packages:"); next(); }, updateRank);
router.patch("/toggleStatus/:id", protectRoute, adminOnly, (req, res, next) => { bustCacheByPrefix("packages:"); next(); }, toggleStatus);
router.delete("/deletePackage/:id", protectRoute, adminOnly, (req, res, next) => { bustCacheByPrefix("packages:"); next(); }, deletePackage);
router.post("/like", toggleLike);
router.post("/sync-from-sheet", protectRoute, adminOnly, syncFromSheet);

export default router;
