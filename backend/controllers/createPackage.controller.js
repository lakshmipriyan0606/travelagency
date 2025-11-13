import Package from "../models/Package.model.js";

export const createPackage = async (req, res) => {
  try {
    const { packageType, location, days, price, offerPrice,isBestPackage ,bestRank,rating} = req.body;

    const imageUrls = req.files.map((file) => file.path);

    const pkg = await Package.create({
      packageType,
      location,
      days,
      rating,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      images: imageUrls,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Package created", pkg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
