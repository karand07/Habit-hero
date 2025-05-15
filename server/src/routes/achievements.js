import express from 'express';
import { authenticate } from '../controllers/auth.js'; // Adjust path as necessary
import {
  getAllAvailableAchievements,
  getUserAchievements
} from '../controllers/achievements.js';

const router = express.Router();

// GET /api/achievements - Get all available achievements (public)
router.get('/', getAllAvailableAchievements);

// GET /api/achievements/my - Get achievements unlocked by the current user (protected)
router.get('/my', authenticate, getUserAchievements);

export default router;
