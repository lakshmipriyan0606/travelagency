/**
 * ============================================================================
 * Multer File Upload Configuration
 * ============================================================================
 *
 * Layer:
 * Configuration / File Handling
 *
 * Responsibility:
 * Configures multer to store uploaded files in memory (RAM) temporarily
 * before they are streamed to external storage (e.g., Cloudinary).
 *
 * Called By:
 * src/modules/upload/upload.admin.routes.js
 * ============================================================================
 */
import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({ storage });
