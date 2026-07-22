import express from "express";
import { protectRoute } from "../../../middleware/auth/auth.middleware.js";
import { upload } from "../../../config/multer.js";
import { uploadImage } from "../../../modules/upload/upload.controller.js";

const router = express.Router();

router.post("/image", protectRoute, upload.single("image"), uploadImage);

export default router;
