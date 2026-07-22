import cloudinary from "../../config/cloudinary.js";
import { MAX_CLOUDINARY_RESULTS } from "./upload.constants.js";

export const uploadStreamToCloudinary = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) return reject(err);
          resolve(result && result.secure_url ? result.secure_url : null);
        }
      );
      stream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });

export const fetchCloudinaryResources = async (folderPrefix = "") => {
  const prefix = folderPrefix ? `${folderPrefix}/` : "";
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix,
    max_results: MAX_CLOUDINARY_RESULTS,
  });

  return (result.resources || []).map((resource) => ({
    url: resource.secure_url,
    publicId: resource.public_id,
    createdAt: resource.created_at,
  }));
};
