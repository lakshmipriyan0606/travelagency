/**
 * ============================================================================
 * Upload Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Processes image upload requests. Resolves the target destination folder
 * and ensures basic validation before passing the buffer to Cloudinary.
 *
 * Called By:
 * src/modules/upload/upload.controller.js
 *
 * Depends On:
 * src/modules/upload/upload.repository.js
 * ============================================================================
 */
import * as uploadRepository from './upload.repository.js';
import { DEFAULT_UPLOAD_FOLDER } from './upload.constants.js';

export const uploadImageService = async (file, bodyFolder, queryFolder) => {
  if (!file || !file.buffer) {
    const error = new Error('No image provided');
    error.statusCode = 400;
    throw error;
  }

  // Priority: Body payload > Query param > Default fallback
  const folder = bodyFolder || queryFolder || DEFAULT_UPLOAD_FOLDER;
  const url = await uploadRepository.uploadStreamToCloudinary(file.buffer, folder);

  if (!url) {
    const error = new Error('Upload failed');
    error.statusCode = 500;
    throw error;
  }

  return { url };
};

export const getAllImagesService = async (folder) => {
  return await uploadRepository.fetchCloudinaryResources(folder);
};
