import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import { uploadImage } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/image", protectRoute, upload.single("image"), uploadImage);

export default router;
