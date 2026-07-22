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

/**
 * Handle image upload.
 *
 * Request Flow:
 * Admin Client
 *   ↓
 * Route (POST /api/v1/b2c-admin/upload) -> Multer Middleware parses memory buffer
 *   ↓
 * Controller (uploadImage)
 *   ↓
 * Service (uploadImageService)
 *   ↓
 * Repository (uploadStreamToCloudinary)
 *   ↓
 * External SDK (Cloudinary)
 *   ↓
 * Response (201 Created)
 */
export const uploadImage = async (req, res) => {
  try {
    const result = await uploadService.uploadImageService(
      req.file,
      req.body?.folder,
      req.query?.folder
    );
    return res.status(201).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Server error' });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const images = await uploadService.getAllImagesService(req.query?.folder);
    return res.status(200).json({ images });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch images' });
  }
};
