/**
 * ============================================================================
 * Upload Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests for uploading images to Cloudinary via a
 * multipart/form-data payload parsing middleware (Multer).
 *
 * Called By:
 * src/modules/upload/upload.admin.routes.js
 *
 * Depends On:
 * src/modules/upload/upload.service.js
 * ============================================================================
 */
import * as uploadService from './upload.service.js';
import { sendSuccess } from '#shared/utils/response.js';

export const uploadImage = async (req, res, next) => {
  try {
    const result = await uploadService.uploadImageService(
      req.file,
      req.body?.folder,
      req.query?.folder
    );
    return sendSuccess(res, 201, 'Image uploaded', result);
  } catch (error) {
    next(error);
  }
};

export const getAllImages = async (req, res, next) => {
  try {
    const images = await uploadService.getAllImagesService(req.query?.folder);
    return sendSuccess(res, 200, 'Images fetched', { images });
  } catch (error) {
    next(error);
  }
};
