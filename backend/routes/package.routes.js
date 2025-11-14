import express from "express";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import { createPackage } from "../controllers/createPackage.controller.js";
import PackageModel from "../models/Package.model.js";
const router = express.Router();

router.post(
  "/create",
  protectRoute,
  adminOnly,
  upload.any(),         // receive all files
  createPackage
);
router.get("/bestpackages", async (req, res) => {
  try {
    const bestPackages = await PackageModel.find({ isBestPackage: true });

    res.status(200).json({
      data: bestPackages,
      message: "All best packages fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching best packages",
      error: error.message,
    });
  }
});

export default router;
