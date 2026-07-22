import * as uploadRepository from "./upload.repository.js";
import { DEFAULT_UPLOAD_FOLDER } from "./upload.constants.js";

export const uploadImageService = async (file, bodyFolder, queryFolder) => {
  if (!file || !file.buffer) {
    const error = new Error("No image provided");
    error.statusCode = 400;
    throw error;
  }

  const folder = bodyFolder || queryFolder || DEFAULT_UPLOAD_FOLDER;
  const url = await uploadRepository.uploadStreamToCloudinary(file.buffer, folder);

  if (!url) {
    const error = new Error("Upload failed");
    error.statusCode = 500;
    throw error;
  }

  return { url };
};

export const getAllImagesService = async (folder) => {
  return await uploadRepository.fetchCloudinaryResources(folder);
};
