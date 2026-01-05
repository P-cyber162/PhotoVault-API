import express from 'express';
import { 
  signUp, 
  login, 
  protect,
  forgotPassword, 
  resetPassword,
  googleAuth,
  googleCallback
} from './../Controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);  
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;