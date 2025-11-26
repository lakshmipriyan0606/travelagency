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
    const userId = req?.headers?.userid;
    console.log('userId: ', userId);
    const bestPackages = await PackageModel.find({ isBestPackage: true });

    const finalBestPackages = bestPackages.map((pkg) => {
      const userLike = pkg.likes.find((like) => like.userId === userId);
      return {
        ...pkg.toObject(),
        userLiked: userLike ? userLike.liked : false,
      };
    });

    res.status(200).json({
      data: finalBestPackages,
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
    const userId = req?.headers?.userid;
    const bestPackages = await PackageModel.find();

    const finalAllPackages = bestPackages.map((pkg) => {
      const userLike = pkg.likes.find((like) => like.userId === userId);
      return {
        ...pkg.toObject(),
        userLiked: userLike ? userLike.liked : false,
      };
    });

    res.status(200).json({
      data: finalAllPackages,
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

router.post("/like", async (req, res) => {
  const { userId, id, liked } = req.body;

  try {
    const pkg = await PackageModel.findById(id);
    console.log('pkg: ', pkg);

    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const userIndex = pkg.likes.findIndex((like) => like.userId === userId);
    console.log('userIndex: ', userIndex);

    if (userIndex >= 0) {
      pkg.likes[userIndex].liked = liked;
    } else {
      pkg.likes.push({ userId, liked });
    }

    await pkg.save();

    res.json({ message: "Updated", likes: pkg.likes });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
});

export default router;
