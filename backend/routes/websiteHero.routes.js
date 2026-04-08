import express from "express";
import mongoose from "mongoose";
import WebsiteHero from "../models/WebsiteHero.model.js";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

const normalizeImages = (images) => {
  const arr = Array.isArray(images) ? images : [];
  return arr
    .map((item) => {
      if (typeof item === "string") {
        const url = item.trim();
        return url ? { url, alt: "" } : null;
      }
      if (item && typeof item === "object") {
        const url = (item.url ?? "").toString().trim();
        if (!url) return null;
        const alt = (item.alt ?? "").toString();
        return { url, alt };
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 5);
};

// Public: get active hero (fallback to latest)
router.get("/active", async (_req, res) => {
  try {
    // Prevent browser/proxy caching (avoids 304 Not Modified when admin changes hero)
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const hero =
      (await WebsiteHero.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean()) ||
      (await WebsiteHero.findOne({}).sort({ updatedAt: -1 }).lean());

    if (!hero) {
      return res.status(200).json({
        data: {
          title: "Best Travel Agency in Malaysia",
          description: "",
          backgroundImages: [],
        },
      });
    }

    return res.status(200).json({
      data: {
        _id: hero._id,
        title: hero.title || "",
        description: hero.description || "",
        backgroundImages: normalizeImages(hero.backgroundImages),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active website hero", error: error.message });
  }
});

// Admin: list all hero cards
router.get("/", protectRoute, adminOnly, async (_req, res) => {
  try {
    const list = await WebsiteHero.find({}).sort({ isActive: -1, updatedAt: -1 }).lean();
    return res.status(200).json({ data: list });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch hero list", error: error.message });
  }
});

// Admin: create
router.post("/", protectRoute, adminOnly, async (req, res) => {
  try {
    const { title, description, backgroundImages, isActive } = req.body || {};
    const images = normalizeImages(backgroundImages);
    if (!images.length) {
      return res.status(400).json({ message: "At least one background image is required" });
    }
    const doc = await WebsiteHero.create({
      title: (title ?? "").toString(),
      description: (description ?? "").toString(),
      backgroundImages: images,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return res.status(201).json({ message: "Hero created", data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create hero", error: error.message });
  }
});

// Admin: update
router.put("/:id", protectRoute, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const { title, description, backgroundImages, isActive } = req.body || {};
    const update = {};
    if (title !== undefined) update.title = (title ?? "").toString();
    if (description !== undefined) update.description = (description ?? "").toString();
    if (backgroundImages !== undefined) {
      const images = normalizeImages(backgroundImages);
      if (!images.length) return res.status(400).json({ message: "At least one background image is required" });
      update.backgroundImages = images;
    }
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const doc = await WebsiteHero.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!doc) return res.status(404).json({ message: "Hero not found" });

    return res.status(200).json({ message: "Hero updated", data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update hero", error: error.message });
  }
});

// Admin: delete
router.delete("/:id", protectRoute, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const doc = await WebsiteHero.findByIdAndDelete(id).lean();
    if (!doc) return res.status(404).json({ message: "Hero not found" });
    return res.status(200).json({ message: "Hero deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete hero", error: error.message });
  }
});

export default router;

