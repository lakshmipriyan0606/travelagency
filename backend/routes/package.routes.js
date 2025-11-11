import express from "express";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import { createPackage } from "../controllers/createPackage.controller.js";
const router = express.Router();

router.post(
  "/create",
  protectRoute,
  adminOnly,
  upload.array("images", 3),
  createPackage
);

router.get("/", (req, res) => {
  res.json({ message: "All packages fetched" });
});

export default router;
