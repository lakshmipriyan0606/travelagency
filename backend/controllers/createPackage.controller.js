import Package from "../models/Package.model.js";
import cloudinary from "../config/cloudinary.js";

export const createPackage = async (req, res) => {
  try {
    const {
      packageType,
      location,
      daysAndNights,
      rating,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
    } = req.body;

    // Parse days JSON
    const days = JSON.parse(req.body.days);

    // Cloudinary Upload Helper
    const uploadFile = (file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "travel_packages" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result.secure_url);
          }
        ).end(file.buffer);
      });
    };

    // MAIN IMAGES
    const mainImages = [];
    for (const file of req.files.filter(f => f.fieldname === "images")) {
      const url = await uploadFile(file);
      mainImages.push(url);
    }

    // SLOT IMAGES
    const transformedDays = [];

    for (let d = 0; d < days.length; d++) {
      const day = days[d];
      const newSlots = [];

      for (let s = 0; s < day.slots.length; s++) {
        const slot = day.slots[s];

        // fieldname = slotImage_0_0
        const slotFile = req.files.find(
          f => f.fieldname === `slotImage_${d}_${s}`
        );

        let slotImageUrl = slot.image || "";

        if (slotFile) {
          slotImageUrl = await uploadFile(slotFile);
        }

        newSlots.push({
          ...slot,
          imageUrl: slotImageUrl
        });
      }

      transformedDays.push({
        ...day,
        slots: newSlots
      });
    }

    // CREATE PACKAGE
    const pkg = await Package.create({
      packageType,
      location,
      daysAndNights,
      rating,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      images: mainImages,
      days: transformedDays,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Package created successfully",
      data: pkg
    });

  } catch (error) {
    console.error("Create package error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
