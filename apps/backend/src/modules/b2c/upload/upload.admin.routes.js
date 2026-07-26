import express from 'express';
import { protectRoute } from '#b2c/middleware/auth.middleware.js';
import { upload } from '#config/multer.js';
import { uploadImage, getAllImages } from './upload.controller.js';

const router = express.Router();

router.post('/image', protectRoute, upload.single('image'), uploadImage);
router.get('/all', protectRoute, getAllImages);

export default router;
