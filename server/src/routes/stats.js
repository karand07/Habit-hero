import express from 'express';
import { authenticate } from '../controllers/auth.js';
import { getStatsSummary, getActivityTimeline } from '../controllers/stats.js';

const router = express.Router();

// GET /api/stats/summary - Get overall statistics summary (protected)
router.get('/summary', authenticate, getStatsSummary);

// GET /api/stats/activity-timeline - Get daily completion counts (protected)
router.get('/activity-timeline', authenticate, getActivityTimeline);

// We will add more routes here for different stats

export default router; 