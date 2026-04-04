import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { medicalSearch, getSearchHistory } from '../controllers/searchController.js';

const router = express.Router();

router.post('/', protect, medicalSearch);
router.get('/history', protect, getSearchHistory);

export default router;
