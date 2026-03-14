import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image provided" });
    }

    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result && result.secure_url ? result.secure_url : null);
        }
      );
      stream.end(req.file.buffer);
    });

    if (!url) {
      return res.status(500).json({ message: "Upload failed" });
    }

    return res.status(201).json({ url });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getAllImages = async (req, res) => {
  try {
    // Note: Cloudinary Admin API might require specific permissions or be rate-limited
    // We use the search API or resources API
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "uploads/", // Only images from our 'uploads' folder
      max_results: 100,
    });

    const images = result.resources.map((resource) => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      createdAt: resource.created_at,
    }));

    return res.status(200).json({ images });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch images" });
  }
};
