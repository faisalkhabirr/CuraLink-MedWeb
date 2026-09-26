import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  register,
  login,
  getMe,
  changePassword,
  logoutEverywhere,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/logout-all', protect, logoutEverywhere);

export default router;
