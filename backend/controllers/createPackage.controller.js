import Package from "../models/Package.model.js";
import cloudinary from "../config/cloudinary.js";

// Helper: upload buffer to cloudinary using upload_stream
const uploadFile = (file, folder = "travel_packages") =>
  new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) return reject(err);
          resolve(result && result.secure_url ? result.secure_url : null);
        }
      );
      stream.end(file.buffer);
    } catch (err) {
      reject(err);
    }
  });

// Helper: Consistent image sanitization
const sanitizeImagesArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(img => {
    if (typeof img === 'string') {
      const url = img.trim();
      return (url && url.startsWith('http')) ? { url, alt: "" } : null;
    }
    if (img && typeof img === 'object' && typeof img.url === 'string') {
      const url = img.url.trim();
      if (url && url.startsWith('http')) {
         return { url, alt: (img.alt || "").toString() };
      }
    }
    return null;
  }).filter(Boolean);
};

export const createPackage = async (req, res) => {
  try {
    const {
      type,
      packageType,
      location,
      daysAndNights,
      hotelName,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      packageName,
      packageDescription,
      country,
      isActive,
      status,
      activityCategory,
      operatingHours,
      languages,
      isInstantConfirmation,
      isNonRefundable,
      highlights,
      seo,
    } = req.body;

    const isActivity =
      (type && String(type).toLowerCase() === "activity") ||
      (activityCategory && activityCategory !== "" && activityCategory !== "none");

    // 1) Parse existing images and upload new ones
    let mainImages = [];
    if (req.body.existingImages) {
      mainImages = JSON.parse(req.body.existingImages);
    }

    const newMainFiles = (req.files || []).filter((f) => f.fieldname === "images");
    const mainImageAlts = req.body.mainImageAlts ? JSON.parse(req.body.mainImageAlts) : [];

    for (let i = 0; i < newMainFiles.length; i++) {
        const url = await uploadFile(newMainFiles[i], "travel_packages/main");
        if (url) mainImages.push({ url, alt: mainImageAlts[i] || "" });
    }

    const sanitizedMainImages = sanitizeImagesArray(mainImages);

    // 2) Parse Days and Slot Images
    const daysRaw = JSON.parse(req.body.days || "[]");
    const transformedDays = [];
    for (let d = 0; d < daysRaw.length; d++) {
      const day = daysRaw[d] || {};
      const slots = Array.isArray(day.slots) ? day.slots : [];
      const newSlots = [];

      for (let s = 0; s < slots.length; s++) {
        const slot = slots[s] || {};
        const slotFile = (req.files || []).find(f => f.fieldname === `slotImage_${d}_${s}`);
        let slotImageUrl = slot.imageUrl || "";

        if (slotFile) {
          const url = await uploadFile(slotFile, "travel_packages/slots");
          if (url) slotImageUrl = url;
        }
        newSlots.push({ ...slot, imageUrl: slotImageUrl || "" });
      }
      transformedDays.push({ ...day, slots: newSlots });
    }

    // 3) Create and Save
    const pkg = new Package({
      type: isActivity ? "activity" : "package",
      packageName,
      packageDescription,
      packageType: isActivity ? "" : packageType,
      location,
      daysAndNights,
      hotelName: isActivity ? "" : hotelName,
      price: Number(price) || 0,
      offerPrice: isActivity ? 0 : (Number(offerPrice) || 0),
      isBestPackage: isBestPackage === 'true' || isBestPackage === true,
      bestRank: bestRank ? Number(bestRank) : null,
      images: sanitizedMainImages,
      days: transformedDays,
      country,
      isActive: isActive !== 'false',
      status: status || 'Active',
      activityCategory: isActivity ? activityCategory : null,
      seo: seo ? JSON.parse(seo) : {},
      operatingHours: operatingHours || "",
      languages: languages || "",
      isInstantConfirmation: isInstantConfirmation === 'true' || isInstantConfirmation === true,
      isNonRefundable: isNonRefundable === 'true' || isNonRefundable === true,
      highlights: highlights ? JSON.parse(highlights) : [],
      createdBy: req.user._id,
    });

    // Handle bestRank rank swap if needed
    if (pkg.isBestPackage && pkg.bestRank) {
      const existing = await Package.findOne({ bestRank: pkg.bestRank });
      if (existing) {
        existing.isBestPackage = false;
        existing.bestRank = null;
        await existing.save();
      }
    }

    await pkg.save();
    res.status(201).json({ message: "Package created successfully", data: pkg });

  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const {
      type,
      packageType,
      location,
      daysAndNights,
      hotelName,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      packageName,
      packageDescription,
      country,
      isActive,
      status,
      activityCategory,
      operatingHours,
      languages,
      isInstantConfirmation,
      isNonRefundable,
      highlights,
      seo,
    } = req.body;

    const isActivity =
      (type && String(type).toLowerCase() === "activity") ||
      (activityCategory && activityCategory !== "" && activityCategory !== "none");

    // 1) Images
    let mainImages = [];
    if (req.body.existingImages) {
      mainImages = JSON.parse(req.body.existingImages);
    }
    const newMainFiles = (req.files || []).filter((f) => f.fieldname === "images");
    const mainImageAlts = req.body.mainImageAlts ? JSON.parse(req.body.mainImageAlts) : [];

    for (let i = 0; i < newMainFiles.length; i++) {
        const url = await uploadFile(newMainFiles[i], "travel_packages/main");
        if (url) mainImages.push({ url, alt: mainImageAlts[i] || "" });
    }

    pkg.images = sanitizeImagesArray(mainImages);

    // 2) Days/Slots
    const daysRaw = JSON.parse(req.body.days || "[]");
    const transformedDays = [];
    for (let d = 0; d < daysRaw.length; d++) {
      const day = daysRaw[d] || {};
      const slots = Array.isArray(day.slots) ? day.slots : [];
      const newSlots = [];

      for (let s = 0; s < slots.length; s++) {
        const slot = slots[s] || {};
        const slotFile = (req.files || []).find(f => f.fieldname === `slotImage_${d}_${s}`);
        let slotImageUrl = slot.imageUrl || "";

        if (slotFile) {
          const url = await uploadFile(slotFile, "travel_packages/slots");
          if (url) slotImageUrl = url;
        }
        newSlots.push({ ...slot, imageUrl: slotImageUrl || "" });
      }
      transformedDays.push({ ...day, slots: newSlots });
    }

    // 3) Update Fields
    pkg.type = isActivity ? "activity" : "package";
    pkg.packageName = packageName;
    pkg.packageDescription = packageDescription;
    pkg.location = location;
    pkg.country = country;
    pkg.daysAndNights = daysAndNights;
    pkg.price = Number(price) || 0;
    pkg.isActive = isActive !== 'false';
    pkg.status = status || pkg.status;
    pkg.activityCategory = isActivity ? activityCategory : null;
    pkg.hotelName = isActivity ? "" : hotelName;
    pkg.offerPrice = isActivity ? 0 : (Number(offerPrice) || 0);
    pkg.packageType = isActivity ? "" : packageType;
    pkg.days = transformedDays;
    pkg.operatingHours = operatingHours || "";
    pkg.languages = languages || "";
    pkg.isInstantConfirmation = isInstantConfirmation === 'true' || isInstantConfirmation === true;
    pkg.isNonRefundable = isNonRefundable === 'true' || isNonRefundable === true;
    
    if (seo) pkg.seo = JSON.parse(seo);
    if (highlights) pkg.highlights = JSON.parse(highlights);

    // Best Package Rank Swap logic
    const isBestPackageBool = String(isBestPackage) === "true";
    if (isBestPackageBool && bestRank) {
      const targetRank = Number(bestRank);
      if (pkg.bestRank !== targetRank) {
        const existing = await Package.findOne({ bestRank: targetRank, _id: { $ne: pkg._id } });
        if (existing) {
          existing.isBestPackage = false;
          existing.bestRank = null;
          await existing.save();
        }
      }
      pkg.isBestPackage = true;
      pkg.bestRank = targetRank;
    } else if (!isBestPackageBool) {
      pkg.isBestPackage = false;
      pkg.bestRank = null;
    }

    await pkg.save();
    res.status(200).json({ message: "Package updated successfully", data: pkg });

  } catch (error) {
    console.error("Update package error:", error);
    res.status(500).json({ error: error.message });
  }
};
