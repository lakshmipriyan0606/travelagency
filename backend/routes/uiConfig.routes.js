import express from "express";
import UiConfig from "../models/UiConfig.model.js";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

const CONFIG_KEY = "default";

const normalizeImages = (images, legacySingle) => {
  const arr = Array.isArray(images) ? images : [];

  const cleaned = arr
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

  if (cleaned.length) return cleaned;
  const legacy = (legacySingle ?? "").toString().trim();
  return legacy ? [{ url: legacy, alt: "" }] : [];
};

// Website Hero (public GET)
router.get("/website-hero", async (_req, res) => {
  try {
    const doc = await UiConfig.findOne({ key: CONFIG_KEY }).lean();
    const hero = doc?.websiteHero || {};
    return res.status(200).json({
      data: {
        title: hero.title || "Best Travel Agency in Malaysia",
        description: hero.description || "",
        backgroundImages: normalizeImages(hero.backgroundImages, hero.backgroundImageUrl),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch website hero config", error: error.message });
  }
});

// Website Hero (admin update)
router.put("/website-hero", protectRoute, adminOnly, async (req, res) => {
  try {
    const { title, description, backgroundImages, backgroundImageUrl } = req.body || {};
    const payload = {
      title: (title ?? "").toString(),
      description: (description ?? "").toString(),
      backgroundImages: normalizeImages(backgroundImages, backgroundImageUrl),
    };

    const updated = await UiConfig.findOneAndUpdate(
      { key: CONFIG_KEY },
      { $set: { websiteHero: payload } },
      { upsert: true, new: true }
    ).lean();

    return res.status(200).json({ message: "Website hero updated", data: updated.websiteHero });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update website hero config", error: error.message });
  }
});

export default router;

