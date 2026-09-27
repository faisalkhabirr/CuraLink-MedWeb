import express from 'express';
import protect from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';
import {
  register,
  login,
  getMe,
  changePassword,
  logoutEverywhere,
} from '../controllers/authController.js';

const router = express.Router();

// Payload shape is checked (and normalized) before the controller runs; the
// controller keeps its own guards as defense in depth.
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/logout-all', protect, logoutEverywhere);

export default router;
