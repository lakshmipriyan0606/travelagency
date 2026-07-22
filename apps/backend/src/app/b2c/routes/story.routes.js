import express from "express";
import { getAllStories } from "../../../modules/stories/story.controller.js";

const router = express.Router();

router.get("/", getAllStories);

export default router;
