import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createStory,
  getAllStories,
  deleteStory,
  moveStory,
  normalizeStoriesOrder,
} from "../controllers/story.controller.js";

const router = express.Router();

// Public route
router.get("/", getAllStories);

// Admin routes
router.post("/", protectRoute, createStory);
router.delete("/:id", protectRoute, deleteStory);
router.post("/:id/move", protectRoute, moveStory);
router.post("/normalize", protectRoute, normalizeStoriesOrder);

export default router;
