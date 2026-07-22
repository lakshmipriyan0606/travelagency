import * as uploadService from "./upload.service.js";

export const uploadImage = async (req, res) => {
  try {
    const result = await uploadService.uploadImageService(req.file, req.body?.folder, req.query?.folder);
    return res.status(201).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Server error" });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const images = await uploadService.getAllImagesService(req.query?.folder);
    return res.status(200).json({ images });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch images" });
  }
};
