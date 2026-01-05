import express from 'express';
import { uploadPhoto, uploadMultiplePhotos, deletePhoto } from './../Controllers/uploadController.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import { protect } from './../Controllers/authController.js';

const router = express.Router();

// Protect all routes (require authentication)
router.use(protect);

// Upload single photo
router.post('/single', uploadSingle, uploadPhoto);

// Upload multiple photos
router.post('/multiple', uploadMultiple, uploadMultiplePhotos);

// Delete photo
router.delete('/:publicId', deletePhoto);

export default router;