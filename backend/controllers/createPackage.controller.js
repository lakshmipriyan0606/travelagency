import Package from "../models/Package.model.js";

export const createPackage = async (req, res) => {
  try {
    const { title, location, description, price, duration } = req.body;

    const imageUrls = req.files.map(file => file.path); // Cloudinary URLs 🎉

    const pkg = await Package.create({
      title,
      location,
      description,
      price,
      duration,
      images: imageUrls,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Package created", pkg });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
