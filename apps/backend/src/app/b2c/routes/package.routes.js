import express from "express";
import {
  getBestPackages,
  getBestActivities,
  getAllPackages,
  getActivityCategories,
  getLikedPackages,
  getLikeCount,
  getSuggestions,
  getPackageById,
  toggleLike
} from "../../../modules/packages/package.controller.js";

const router = express.Router();

router.get("/bestpackages", getBestPackages);
router.get("/bestactivities", getBestActivities);
router.get("/", getAllPackages);
router.get("/activitycategories", getActivityCategories);
router.get("/liked", getLikedPackages);
router.get("/likeCount", getLikeCount);
router.get("/suggestions", getSuggestions);
router.get("/:id", getPackageById);
router.post("/like", toggleLike);

export default router;
