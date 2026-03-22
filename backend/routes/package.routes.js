import express from "express";
import mongoose from "mongoose";
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
      isActive: { $ne: false },
      isDeleted: { $ne: true } 
    });

    const finalBestPackages = bestPackages.map((pkg) => {
      const userLike = pkg.likes.find((like) => like.userId === userId);
      return {
        ...pkg.toObject(),
        hotelName: pkg.hotelName || (pkg.rating ? `${pkg.rating} Stars Hotel` : ""),
        userLiked: userLike ? userLike.liked : false,
      };
    });

    finalBestPackages.sort((a, b) => a.bestRank - b.bestRank);

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
    const activityCategory = req.query.activityCategory;
    const onlyActivities = req.query.onlyActivities === 'true';
    const excludeActivities = req.query.excludeActivities === 'true';

    const isAdmin = req.query.isAdmin === 'true';
    const query = isAdmin ? { isDeleted: { $ne: true } } : { isActive: { $ne: false }, isDeleted: { $ne: true } };
    const andConditions = [];

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

    // Filter by activity category
    if (activityCategory) {
      andConditions.push({ activityCategory: { $regex: activityCategory, $options: "i" } });
    }

    // Strict separation
    if (onlyActivities) {
      andConditions.push({ 
        activityCategory: { $ne: null, $exists: true, $not: /none/i } 
      });
    } else if (excludeActivities) {
      andConditions.push({ 
        $or: [
          { activityCategory: null }, 
          { activityCategory: { $exists: false } }, 
          { activityCategory: "" }, 
          { activityCategory: "none" }
        ] 
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const totalCount = await PackageModel.countDocuments(query);

    // Add pagination condition only for the data fetch
    if (lastId) {
      if (query.$and) {
        query.$and = [...query.$and, { _id: { $lt: lastId } }];
      } else {
        query.$and = [{ _id: { $lt: lastId } }];
      }
    }

    const packages = await PackageModel.find(query)
      .sort({ _id: -1 })
      .limit(limit);

    const finalAllPackages = packages.map((pkg) => {
      const userLike = pkg.likes.find(
        (like) => like.userId?.toString() === userId?.toString()
      );

      return {
        ...pkg.toObject(),
        hotelName: pkg.hotelName || (pkg.rating ? `${pkg.rating} Stars Hotel` : ""),
        userLiked: userLike ? userLike.liked : false,
      };
    });

    res.status(200).json({
      data: finalAllPackages,
      totalCount,
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

// Get all distinct activity categories that have at least one active package
// We merge with a predefined list to ensure the Home page always looks rich
router.get("/activitycategories", async (req, res) => {
  try {
    const predefinedCategories = [
      "Sightseeing", "Water Sports", "Hiking", "Shopping", 
      "Relaxing", "Boating", "Snorkeling", "Safari", 
      "Adventure", "Diving", "Cycling", "Skiing", "Cultural"
    ];

    const dbCategories = await PackageModel.distinct("activityCategory", {
      activityCategory: { $ne: null, $exists: true, $not: /none/i },
      isActive: { $ne: false },
      isDeleted: { $ne: true },
    });

    // Merge and remove duplicates
    const allCategories = Array.from(new Set([...dbCategories, ...predefinedCategories])).filter(Boolean);

    res.status(200).json({ data: allCategories, message: "Activity categories fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity categories", error: error.message });
  }
});



router.get("/likeCount", async (req, res) => {
  try {
    const userId = req?.headers?.userid;
    const allPackage = await PackageModel.find({ isDeleted: { $ne: true } });

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
      packageName: { $regex: q, $options: "i" },
      isDeleted: { $ne: true }
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
      ],
      isDeleted: { $ne: true }
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


// Fetch taken ranks (must be ABOVE the /:id catch-all)
router.get("/takenRanks", async (req, res) => {
  try {
    const packages = await PackageModel.find(
      { isBestPackage: true, bestRank: { $ne: null }, isDeleted: { $ne: true } },
      { bestRank: 1, _id: 1, packageName: 1 }
    );
    const takenRanks = packages.map(p => ({
      rank: p.bestRank,
      packageId: p._id,
      packageName: p.packageName,
    }));
    return res.json({ takenRanks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let currentPackage;

    // 1. Check if it's a valid MongoDB ObjectId
    if (mongoose.isValidObjectId(id)) {
      currentPackage = await PackageModel.findOne({ 
        _id: id, 
        isDeleted: { $ne: true } 
      });
    }

    // 2. If not found or not a valid ID, try matching by slug (package name)
    if (!currentPackage) {
      const decodedId = decodeURIComponent(id).trim();

      // Create a regex: replace hyphens with .* for fuzzy matching
      const escapedPattern = decodedId
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') 
        .replace(/-/g, ".*"); 
      
      // Allow for potential leading/trailing whitespace in the database name
      const slugRegex = new RegExp(`^\\s*${escapedPattern}\\s*$`, "i");
      
      currentPackage = await PackageModel.findOne({
        packageName: { $regex: slugRegex },
        isDeleted: { $ne: true }
      });
    }

    if (!currentPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.status(200).json({
      data: currentPackage,
      message: "Package fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching package detail",
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


// Quick Rank Update (Admin only)
router.patch("/updateRank/:id", protectRoute, adminOnly, async (req, res) => {
  try {
    const { bestRank } = req.body;
    const packageId = req.params.id;

    const currentPackage = await PackageModel.findById(packageId);
    if (!currentPackage) return res.status(404).json({ message: "Package not found" });

    if (bestRank === null || bestRank === "" || bestRank === "0") {
      // Remove rank
      currentPackage.isBestPackage = false;
      currentPackage.bestRank = null;
      await currentPackage.save();
      return res.json({ message: "Rank removed", data: currentPackage });
    }

    // Check if another package holds this rank
    const existingWithRank = await PackageModel.findOne({
      bestRank,
      isBestPackage: true,
      _id: { $ne: packageId },
    });

    if (existingWithRank) {
      if (currentPackage.isBestPackage && currentPackage.bestRank) {
        // Swap ranks
        existingWithRank.bestRank = currentPackage.bestRank;
        await existingWithRank.save();
      } else {
        // Demote other
        existingWithRank.bestRank = null;
        existingWithRank.isBestPackage = false;
        await existingWithRank.save();
      }
    }

    currentPackage.isBestPackage = true;
    currentPackage.bestRank = bestRank;
    await currentPackage.save();

    return res.json({ message: "Rank updated", data: currentPackage });
  } catch (error) {
    console.error("Quick rank update error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Quick Status Toggle (Admin only)
router.patch("/toggleStatus/:id", protectRoute, adminOnly, async (req, res) => {
  try {
    const pkg = await PackageModel.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const newStatus = pkg.status === "Active" ? "Inactive" : "Active";
    pkg.status = newStatus;
    pkg.isActive = newStatus === "Active";
    await pkg.save();

    return res.json({ message: `Package set to ${newStatus}`, data: pkg });
  } catch (error) {
    console.error("Toggle status error:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/deletePackage/:id", async (req, res) => {
  try {
    const deletedPackage = await PackageModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

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

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const pkg = await PackageModel.findOne({ _id: id, isDeleted: { $ne: true } });
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
