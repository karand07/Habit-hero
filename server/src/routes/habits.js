import express from 'express';
import { body } from 'express-validator';
import * as habitController from '../controllers/habits.js';
import { authenticate } from '../controllers/auth.js'; // Corrected import path
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

// Validation middleware for creating/updating a habit
const habitValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('frequency').trim().notEmpty().withMessage('Frequency is required'),
  body('timeOfDay').trim().notEmpty().withMessage('Time of day is required'),
  validateRequest
];

// --- Habit Routes ---

// POST /api/habits - Create a new habit
router.post('/', authenticate, habitValidation, habitController.createHabit);

// GET /api/habits - Get all habits for the authenticated user
router.get('/', authenticate, habitController.getAllHabits);

// GET /api/habits/:id - Get a single habit by its ID
router.get('/:id', authenticate, habitController.getHabitById);

// PUT /api/habits/:id - Update an existing habit
router.put('/:id', authenticate, habitValidation, habitController.updateHabit);

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', authenticate, habitController.deleteHabit);

// --- Habit Log Routes ---

// POST /api/habits/:id/log - Log a completion for a habit
router.post('/:id/log', authenticate, habitController.logHabitCompletion);

// GET /api/habits/:id/logs - Get all logs for a specific habit (optional, for detailed history)
router.get('/:id/logs', authenticate, habitController.getHabitLogs);

export default router; 