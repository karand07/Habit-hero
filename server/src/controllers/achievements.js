import pool from '../config/database.js';

// GET /api/achievements - Get all available achievements
export const getAllAvailableAchievements = async (req, res) => {
  try {
    const [achievements] = await pool.query('SELECT id, title, description, criteria, icon_url FROM achievements ORDER BY title');
    res.status(200).json(achievements);
  } catch (error) {
    console.error('Error fetching all available achievements:', error);
    res.status(500).json({ message: 'Error fetching all available achievements', error: error.message });
  }
};

// GET /api/achievements/my - Get all achievements unlocked by the authenticated user
export const getUserAchievements = async (req, res) => {
  const userId = req.user.id; // From authenticate middleware
  try {
    const [userAchievements] = await pool.query(
      `SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.criteria, 
        a.icon_url, 
        ua.unlocked_at 
      FROM user_achievements ua 
      JOIN achievements a ON ua.achievement_id = a.id 
      WHERE ua.user_id = ? 
      ORDER BY ua.unlocked_at DESC, a.title ASC`,
      [userId]
    );
    res.status(200).json(userAchievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ message: 'Error fetching user achievements', error: error.message });
  }
};
