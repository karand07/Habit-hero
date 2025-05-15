import pool from '../config/database.js';

// GET /api/stats/summary - Get overall statistics summary
export const getStatsSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    // Total habits
    const [habitsResult] = await pool.query('SELECT id, streak, total_completions FROM habits WHERE user_id = ?', [userId]);
    const totalHabits = habitsResult.length;

    // Total completions (logs)
    const [logsResult] = await pool.query('SELECT COUNT(*) as totalCompletions FROM habit_logs WHERE user_id = ?', [userId]);
    const totalCompletions = logsResult[0].totalCompletions;
    
    // Longest overall streak
    let longestOverallStreak = 0;
    if (totalHabits > 0) {
      const streaks = habitsResult.map(h => h.streak);
      longestOverallStreak = Math.max(0, ...streaks);
    }

    // Habits completed today count
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const [completedTodayResult] = await pool.query(
      'SELECT COUNT(DISTINCT habit_id) as habitsCompletedTodayCount FROM habit_logs WHERE user_id = ? AND DATE(completed_at) = ?',
      [userId, today]
    );
    const habitsCompletedTodayCount = completedTodayResult[0].habitsCompletedTodayCount;

    // Overall Engagement Percentage: (habits with at least one completion / total habits) * 100
    let overallEngagementPercentage = 0;
    if (totalHabits > 0) {
      const habitsWithAtLeastOneCompletion = habitsResult.filter(h => h.total_completions > 0).length;
      overallEngagementPercentage = (habitsWithAtLeastOneCompletion / totalHabits) * 100;
    }

    // Average Current Streak
    let averageCurrentStreak = 0;
    if (totalHabits > 0) {
      const totalStreakSum = habitsResult.reduce((sum, h) => sum + h.streak, 0);
      averageCurrentStreak = totalStreakSum / totalHabits;
    }

    res.status(200).json({
      totalHabits,
      totalCompletions,
      longestOverallStreak,
      habitsCompletedTodayCount,
      overallEngagementPercentage: parseFloat(overallEngagementPercentage.toFixed(1)), // Rounded to 1 decimal place
      averageCurrentStreak: parseFloat(averageCurrentStreak.toFixed(1)), // Rounded to 1 decimal place
    });
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    res.status(500).json({ message: 'Error fetching stats summary', error: error.message });
  }
};

// GET /api/stats/activity-timeline - Get daily completion counts for the last N days
export const getActivityTimeline = async (req, res) => {
  const userId = req.user.id;
  const numDays = parseInt(req.query.days, 10) || 30; // Default to 30 days, allow query param

  try {
    const [results] = await pool.query(`
      SELECT 
        DATE_FORMAT(hl.completed_at, '%Y-%m-%d') as date,
        COUNT(hl.id) as completions
      FROM habit_logs hl
      WHERE hl.user_id = ? AND hl.completed_at >= CURDATE() - INTERVAL ? DAY
      GROUP BY DATE_FORMAT(hl.completed_at, '%Y-%m-%d')
      ORDER BY date ASC;
    `, [userId, numDays -1]); // numDays-1 because CURDATE() is one day, interval N-1 makes it N days total

    // Process results to ensure all days in the period are present (fill gaps with 0 completions)
    const timeline = [];
    const today = new Date();
    const endDate = new Date(today); // Clone today
    endDate.setDate(today.getDate() - numDays + 1); // Start date for the period

    const existingDataMap = new Map();
    results.forEach(row => {
      existingDataMap.set(row.date, row.completions);
    });

    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      const formattedDate = currentDate.toISOString().slice(0, 10);
      
      timeline.push({
        date: formattedDate,
        completions: existingDataMap.get(formattedDate) || 0
      });
    }

    res.status(200).json(timeline.reverse()); // Reverse to have oldest date first

  } catch (error) {
    console.error('Error fetching activity timeline:', error);
    res.status(500).json({ message: 'Error fetching activity timeline', error: error.message });
  }
};

// We will add more controller functions here for different stats as needed. 