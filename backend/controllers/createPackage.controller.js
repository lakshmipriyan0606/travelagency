import Package from "../models/Package.model.js";
import cloudinary from "../config/cloudinary.js";

export const createPackage = async (req, res) => {
  try {
    const {
      packageType,
      location,
      days,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      rating,
      daysAndNights,
    } = req.body;

    const imageUrls = req.files.map((file) => file.path);

    const parsedDays = typeof days === "string" ? JSON.parse(days) : days;

    const finalDaysData = await Promise.all(
      parsedDays.map(async (day) => {
        const finalSlots = await Promise.all(
          (day.slots || []).map(async (slot) => {
            let slotImageUrl = slot.imageUrl;

            if (slot.imageUrl && slot.imageUrl.path) {
              const result = await cloudinary.uploader.upload(
                slot.imageUrl.path,
                {
                  folder: "travel_packages/slots",
                }
              );
              slotImageUrl = result.secure_url;
            } else if (
              slot.imageUrl &&
              slot.imageUrl.startsWith("data:image")
            ) {
              const result = await cloudinary.uploader.upload(slot.imageUrl, {
                folder: "travel_packages/slots",
              });
              slotImageUrl = result.secure_url;
            }

            return { ...slot, imageUrl: slotImageUrl };
          })
        );

        return { ...day, slots: finalSlots };
      })
    );

    const pkg = await Package.create({
      packageType,
      location,
      daysAndNights,
      rating,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      images: imageUrls,
      days: finalDaysData,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Package created successfully", pkg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
