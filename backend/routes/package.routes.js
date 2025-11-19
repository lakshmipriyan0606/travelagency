import express from "express";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import {
  createPackage,
  updatePackage,
} from "../controllers/createPackage.controller.js";
import PackageModel from "../models/Package.model.js";
const router = express.Router();

router.post(
  "/create",
  protectRoute,
  adminOnly,
  upload.any(), // receive all files
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

router.get("/", async (req, res) => {
  try {
    const bestPackages = await PackageModel.find();

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
router.get("/:id", async (req, res) => {
  try {
    const currentPackage = await PackageModel.findOne({ _id: req.params.id });
    res.status(200).json({
      data: currentPackage,
      message: "All best packages fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching best packages",
      error: error.message,
    });
  }
});

router.post(
  "/updatePackage/:id",
  protectRoute,
  adminOnly,
  upload.any(),
  updatePackage
);

router.delete("/deletePackage/:id", async (req, res) => {
  try {
    const deletedPackage = await PackageModel.findByIdAndDelete(req.params.id);

    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package deleted successfully", deletedPackage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
