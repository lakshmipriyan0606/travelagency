/**
 * ============================================================================
 * Upload Repository
 * ============================================================================
 *
 * Layer:
 * External Integration / Data Access
 *
 * Responsibility:
 * Encapsulates the Cloudinary SDK. Handles streaming uploads and fetching
 * the Cloudinary media library directly.
 *
 * Called By:
 * src/modules/upload/upload.service.js
 *
 * Depends On:
 * src/config/cloudinary.js
 * ============================================================================
 */
import cloudinary from '#config/cloudinary.js';
import { MAX_CLOUDINARY_RESULTS } from './upload.constants.js';

/**
 * Uploads a file buffer directly to Cloudinary via a stream to avoid
 * saving temporary files on the server disk.
 */
export const uploadStreamToCloudinary = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.secure_url ? result.secure_url : null);
      });
      stream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });

export const fetchCloudinaryResources = async (folderPrefix = '') => {
  const prefix = folderPrefix ? `${folderPrefix}/` : '';
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix,
    max_results: MAX_CLOUDINARY_RESULTS,
  });

  return (result.resources || []).map((resource) => ({
    url: resource.secure_url,
    publicId: resource.public_id,
    createdAt: resource.created_at,
  }));
};
