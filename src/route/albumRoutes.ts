import express from 'express';
import { protect } from '../Controllers/authController.js';
import {
    createAlbum,
    getMyAlbums,
    getAlbum,
    updateAlbum,
    deleteAlbum,
    addPhotoToAlbum
} from '../Controllers/albumController.js';

const router = express.Router();

router.use(protect); // All album routes require authentication

router
    .route('/')
    .get(getMyAlbums)
    .post(createAlbum);

router
    .route('/:id')
    .get(getAlbum)
    .patch(updateAlbum)
    .delete(deleteAlbum);

router
    .route('/:id/photos')
    .post(addPhotoToAlbum);

export default router;