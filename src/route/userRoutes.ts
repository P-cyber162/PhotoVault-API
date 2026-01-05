import express from 'express';
import { protect } from '../Controllers/authController.js';
import { restrictTo } from '../Controllers/authController.js';
import { getUser, deleteUser, getAllUser } from './../Controllers/userControlller.js'

const router = express.Router();

router
    .route('/')
    .get(protect, restrictTo('admin'), getAllUser);

router
    .route('/:username')
    .get(protect, restrictTo('admin'), getUser)
    .delete(protect, restrictTo('admin', 'user'), deleteUser);

export default router;