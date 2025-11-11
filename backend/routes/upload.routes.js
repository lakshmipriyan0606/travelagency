import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { protectRoute,adminOnly } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../controllers/upload.controller.js";

const router = express.Router();

router.post(
  "/",
  protectRoute,
  adminOnly,
  upload.single("image"),
  uploadImage
);

export default router;
