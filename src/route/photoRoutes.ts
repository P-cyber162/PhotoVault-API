import express from 'express';
import { protect, restrictTo } from '../Controllers/authController.js';
import {
    getMyPhotos,
    getPublicPhotos,
    getPhoto,
    updatePhoto,
    deletePhoto
} from '../Controllers/photoController.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicPhotos);

// Protected routes
router.use(protect);

router.get('/my-photos', getMyPhotos);
router
    .route('/:id')
    .get(getPhoto)
    .patch(updatePhoto)
    .delete(deletePhoto);

export default router;