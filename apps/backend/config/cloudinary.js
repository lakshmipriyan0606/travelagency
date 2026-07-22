/**
 * ============================================================================
 * Cloudinary Configuration
 * ============================================================================
 *
 * Layer:
 * Configuration / External Storage
 *
 * Responsibility:
 * Initializes the Cloudinary v2 SDK using environment variables.
 * Allows the application to upload and serve optimized images
 * (destinations, packages, blogs) from a global CDN.
 *
 * Called By:
 * src/modules/upload/upload.service.js
 * ============================================================================
 */
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary.v2;
