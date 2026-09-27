import express from 'express';
import protect from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { searchSchema } from '../validation/schemas.js';
import {
  medicalSearch,
  getSearchHistory,
  exportHistory,
  deleteHistoryItem,
  clearHistory,
} from '../controllers/searchController.js';

const router = express.Router();

// protect runs first so unauthenticated callers still get 401, then the query
// is validated/trimmed before it can reach the paid upstream model call.
router.post('/', protect, validate(searchSchema), medicalSearch);

// Every route below is scoped to req.user.id in the controller - SearchHistory
// is private per user, only SearchCache is shared.
router.get('/history', protect, getSearchHistory);
router.get('/history/export', protect, exportHistory);
router.delete('/history/:id', protect, deleteHistoryItem);
router.delete('/history', protect, clearHistory);

export default router;
