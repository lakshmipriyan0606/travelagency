import express from "express";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import {
  createPackage,
  updatePackage,
} from "../controllers/createPackage.controller.js";
import PackageModel from "../models/Package.model.js";
import { fetchPackagesFromSheet } from "../services/googleSheets.service.js";
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
    const bestPackages = await PackageModel.find({ 
      isBestPackage: true,
      isActive: { $ne: false } 
    });

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
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId;
    
    // Extract filters
    const search = req.query.search;
    const city = req.query.city;

    const isAdmin = req.query.isAdmin === 'true';
    const query = isAdmin ? {} : { isActive: { $ne: false } };
    const andConditions = [];

    if (lastId) {
      andConditions.push({ _id: { $lt: lastId } });
    }

    if (search) {
      andConditions.push({
        $or: [
          { packageName: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { packageType: { $regex: search, $options: "i" } }
        ]
      });
    }

    if (city) {
      andConditions.push({
        $or: [
          { location: { $regex: city, $options: "i" } },
          { city: { $regex: city, $options: "i" } }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const packages = await PackageModel.find(query)
      .sort({ _id: -1 })
      .limit(limit);

    const finalAllPackages = packages.map((pkg) => {
      const userLike = pkg.likes.find(
        (like) => like.userId.toString() === userId
      );

      return {
        ...pkg.toObject(),
        userLiked: userLike ? userLike.liked : false,
      };
    });

    res.status(200).json({
      data: finalAllPackages,
      nextCursor: packages.length ? packages[packages.length - 1]._id : null,
      hasMore: packages.length === limit,
      message: "Packages fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching packages",
      error: error.message,
    });
  }
});

router.get("/likeCount", async (req, res) => {
  try {
    const userId = req?.headers?.userid;
    const allPackage = await PackageModel.find();

    const finalAllPackages = allPackage.map((pkg) => {
      const userLike = pkg.likes.find((like) => like.userId === userId);
      return {
        ...pkg.toObject(),
        userLiked: userLike ? userLike.liked : false,
      };
    });

    const likeTotalCount = finalAllPackages?.filter((pack) => pack?.userLiked);

    res.status(200).json({
      data: likeTotalCount?.length,
      message: "like count fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching like count packages",
      error: error.message,
    });
  }
});

router.get("/suggestions", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.status(200).json({ locations: [], packages: [] });
    }

    // Limit to make it fast
    const limit = 5;

    // Search exact package names
    const packages = await PackageModel.find({
      packageName: { $regex: q, $options: "i" }
    })
      .select("packageName location") // only grab needed fields
      .limit(limit)
      .lean();

    // Search existing locations or cities
    // We can just query anything matching location/city and extract uniques
    const locationDocs = await PackageModel.find({
      $or: [
        { location: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } }
      ]
    })
      .select("location city")
      .limit(20) // pull a small batch to extract uniques
      .lean();

    const uniqueLocations = new Set();
    locationDocs.forEach(doc => {
      const locMatch = doc.location && doc.location.toLowerCase().includes(q.toLowerCase());
      const cityMatch = doc.city && doc.city.toLowerCase().includes(q.toLowerCase());
      
      if (locMatch) uniqueLocations.add(doc.location);
      if (cityMatch) uniqueLocations.add(doc.city);
    });

    res.status(200).json({
      locations: Array.from(uniqueLocations).slice(0, 3), 
      packages: packages
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching suggestions",
      error: error.message
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
    console.log('PackageModel: ', PackageModel);

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
    console.log("pkg: ", pkg);

    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const userIndex = pkg.likes.findIndex((like) => like.userId === userId);
    console.log("userIndex: ", userIndex);

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

router.post("/sync-from-sheet", protectRoute, adminOnly, async (req, res) => {
  try {
    const sheetPackages = await fetchPackagesFromSheet();
    
    if (!sheetPackages || sheetPackages.length === 0) {
      return res.status(400).json({ success: false, message: "No data found in sheet" });
    }

    // Example logic: Update existing packages by name or ID, or insert new ones
    for (const pkgData of sheetPackages) {
      await PackageModel.findOneAndUpdate(
        { packageName: pkgData.packageName },
        { $set: pkgData },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ success: true, message: `Synced ${sheetPackages.length} packages from sheet` });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ success: false, message: "Error syncing from sheet", error: error.message });
  }
});

export default router;
