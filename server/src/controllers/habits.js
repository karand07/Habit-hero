import pool from '../config/database.js';

// POST /api/habits - Create a new habit
export const createHabit = async (req, res) => {
  const { title, description, category, frequency, timeOfDay } = req.body;
  const userId = req.user.id; // From authenticate middleware

  try {
    const [result] = await pool.query(
      'INSERT INTO habits (user_id, title, description, category, frequency, time_of_day) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, description, category, frequency, timeOfDay]
    );
    const habitId = result.insertId;
    const [newHabit] = await pool.query('SELECT * FROM habits WHERE id = ?', [habitId]);
    res.status(201).json(newHabit[0]);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Error creating habit', error: error.message });
  }
};

// GET /api/habits - Get all habits for the authenticated user
export const getAllHabits = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get current date in YYYY-MM-DD format (in server's timezone)
    // MySQL's DATE() function can also be used directly in the query for comparison.
    const today = new Date().toISOString().slice(0, 10);

    // Fetch all habits for the user
    const [habits] = await pool.query('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    if (habits.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch all habit logs for this user that were completed today
    const habitIds = habits.map(h => h.id);
    const [todayLogs] = await pool.query(
      `SELECT habit_id FROM habit_logs WHERE user_id = ? AND DATE(completed_at) = ? AND habit_id IN (${pool.escape(habitIds)})`,
      [userId, today]
    );

    const completedTodayHabitIds = new Set(todayLogs.map(log => log.habit_id));

    // Augment habits with is_completed_today status
    const habitsWithCompletionStatus = habits.map(habit => ({
      ...habit,
      is_completed_today: completedTodayHabitIds.has(habit.id)
    }));

    res.status(200).json(habitsWithCompletionStatus);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Error fetching habits', error: error.message });
  }
};

// GET /api/habits/:id - Get a single habit by its ID
export const getHabitById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const [habit] = await pool.query('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
    if (habit.length === 0) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    res.status(200).json(habit[0]);
  } catch (error) {
    console.error('Error fetching habit by ID:', error);
    res.status(500).json({ message: 'Error fetching habit by ID', error: error.message });
  }
};

// PUT /api/habits/:id - Update an existing habit
export const updateHabit = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, category, frequency, timeOfDay } = req.body;

  try {
    const [habit] = await pool.query('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
    if (habit.length === 0) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }

    await pool.query(
      'UPDATE habits SET title = ?, description = ?, category = ?, frequency = ?, time_of_day = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [title, description, category, frequency, timeOfDay, id, userId]
    );
    const [updatedHabit] = await pool.query('SELECT * FROM habits WHERE id = ?', [id]);
    res.status(200).json(updatedHabit[0]);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Error updating habit', error: error.message });
  }
};

// DELETE /api/habits/:id - Delete a habit
export const deleteHabit = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [habit] = await pool.query('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
    if (habit.length === 0) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }

    // Before deleting the habit, consider deleting associated habit_logs or handle via CASCADE DELETE in DB schema
    await pool.query('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?', [id, userId]);
    await pool.query('DELETE FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
    
    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Error deleting habit', error: error.message });
  }
};

// POST /api/habits/:id/log - Log a completion for a habit
export const logHabitCompletion = async (req, res) => {
  const { id: habitId } = req.params;
  // Only consider debug_completed_at in development environment
  const allowDebugTime = process.env.NODE_ENV === 'development';
  const { debug_completed_at } = allowDebugTime ? req.body : {}; 
  const userId = req.user.id;

  let connection; // Declare connection here to be accessible in finally block

  try {
    connection = await pool.getConnection(); // Get a connection for potential transaction
    await connection.beginTransaction(); // Start transaction

    // Check if habit exists and belongs to user
    const [habitRows] = await connection.query('SELECT * FROM habits WHERE id = ? AND user_id = ? FOR UPDATE', [habitId, userId]);
    if (habitRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    const habit = habitRows[0]; // This is the state before logging this completion

    // Log completion - use debug_completed_at if provided AND in development mode
    const useDebugTimestamp = allowDebugTime && debug_completed_at;
    
    const logCompletionQuery = useDebugTimestamp
      ? 'INSERT INTO habit_logs (habit_id, user_id, completed_at) VALUES (?, ?, ?)'
      : 'INSERT INTO habit_logs (habit_id, user_id) VALUES (?, ?)';
    
    const logCompletionParams = useDebugTimestamp
      ? [habitId, userId, debug_completed_at]
      : [habitId, userId];

    const [result] = await connection.query(logCompletionQuery, logCompletionParams);
    const newLogId = result.insertId;

    // Fetch all logs for this habit to calculate streak
    const [logs] = await connection.query(
      'SELECT completed_at FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY completed_at DESC',
      [habitId, userId]
    );

    console.log(`[DEBUG] Habit ID: ${habitId}, User ID: ${userId} - Found ${logs.length} logs for streak calc.`);
    console.log(`[DEBUG] Habit state before this log: streak = ${habit.streak}, total_completions = ${habit.total_completions}`);

    let currentStreak = 0;
    if (logs.length === 0) { 
        currentStreak = 1;
    } else if (logs.length === 1 && logs[0].id === newLogId) { // Check if the only log is the one just inserted
        currentStreak = 1;
        console.log(`[DEBUG] Streak calc: First log for this habit, streak = 1`);
    } else {
        const currentLogTimestamp = useDebugTimestamp ? new Date(debug_completed_at) : new Date(logs[0].completed_at); // Use the actual timestamp of current log
        const previousLogTimestamp = new Date(logs[1].completed_at);
        
        console.log(`[DEBUG] Current log timestamp for streak: ${currentLogTimestamp.toISOString()}`);
        console.log(`[DEBUG] Previous log timestamp for streak: ${previousLogTimestamp.toISOString()}`);

        const currentLogDate = new Date(currentLogTimestamp);
        currentLogDate.setHours(0, 0, 0, 0);
        const previousLogDate = new Date(previousLogTimestamp);
        previousLogDate.setHours(0, 0, 0, 0);

        console.log(`[DEBUG] Normalized current log date: ${currentLogDate.toISOString()}`);
        console.log(`[DEBUG] Normalized previous log date: ${previousLogDate.toISOString()}`);

        const diffTime = currentLogDate.getTime() - previousLogDate.getTime(); // Use getTime() for reliable difference
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log(`[DEBUG] diffDays: ${diffDays}`);

        if (diffDays === 1) {
            currentStreak = habit.streak + 1;
            console.log(`[DEBUG] Streak incremented: old habit.streak=${habit.streak}, new currentStreak=${currentStreak}`);
        } else if (diffDays === 0) { 
            currentStreak = habit.streak;
            console.log(`[DEBUG] Streak maintained (same day log): habit.streak=${habit.streak}, currentStreak=${currentStreak}`);
        } else { 
            currentStreak = 1;
            console.log(`[DEBUG] Streak reset: new currentStreak=1`);
        }
    }
    
    const newTotalCompletionsForThisHabit = habit.total_completions + 1;
    console.log(`[DEBUG] Calculated currentStreak: ${currentStreak}, newTotalCompletionsForThisHabit: ${newTotalCompletionsForThisHabit}`);

    // Update streak and total_completions in habits table
    await connection.query(
      'UPDATE habits SET total_completions = ?, streak = ? WHERE id = ?',
      [newTotalCompletionsForThisHabit, currentStreak, habitId]
    );

    // --- Achievement Checking Logic ---
    const [allAchievements] = await connection.query('SELECT id, title, description FROM achievements');
    const [userAchievementRows] = await connection.query('SELECT achievement_id FROM user_achievements WHERE user_id = ?', [userId]);
    const unlockedAchievementIds = new Set(userAchievementRows.map(ua => ua.achievement_id));

    const newlyUnlockedAchievements = [];

    // Define achievements to check (could be moved to a config or separate module later)
    const achievementsToProcess = [
      { title: 'First Habit Completed', type: 'first_log_ever' },
      { title: '3-Day Streak', type: 'streak', value: 3 },
      { title: '7-Day Streak', type: 'streak', value: 7 },
      { title: 'Fortnight Focus', type: 'streak', value: 15 },
      { title: 'Month of Mastery', type: 'streak', value: 30 },
      { title: 'Habitual Hero', type: 'habit_completions', value: 10 },
      { title: 'Golden Logger', type: 'habit_completions', value: 50 },
      { title: 'Habit Veteran', type: 'habit_completions', value: 100 },
      { title: 'Category Connoisseur', type: 'distinct_categories', value: 3 },
      { title: 'All-Rounder', type: 'multiple_streaks', streak_threshold: 7, habit_count_threshold: 3 }
    ];

    // Additional data needed for some achievements
    let totalUserLogsCount = 0;
    let distinctLoggedCategoriesCount = 0;
    let qualifyingStreaksCount = 0;

    // Check if total logs count is needed for 'first_log_ever' or 'habit_completions' types
    if (achievementsToProcess.some(ach => 
        (ach.type === 'first_log_ever' || ach.type === 'habit_completions') && 
        !unlockedAchievementIds.has(allAchievements.find(a => a.title === ach.title)?.id)
    )) {
        const [countRows] = await connection.query('SELECT COUNT(*) as count FROM habit_logs WHERE user_id = ?', [userId]);
        totalUserLogsCount = countRows[0].count;
    }
    // Check if distinct categories count is needed
    if (achievementsToProcess.some(ach => 
        ach.type === 'distinct_categories' && 
        !unlockedAchievementIds.has(allAchievements.find(a => a.title === ach.title)?.id)
    )) {
        const [categoryRows] = await connection.query(
            'SELECT COUNT(DISTINCT h.category) as count FROM habits h JOIN habit_logs hl ON h.id = hl.habit_id WHERE hl.user_id = ?',
            [userId]
        );
        distinctLoggedCategoriesCount = categoryRows[0].count;
    }
    // Check for multiple_streaks type to fetch data
    const multiStreakAchievementToProcess = achievementsToProcess.find(ach => ach.type === 'multiple_streaks');
    if (multiStreakAchievementToProcess && !unlockedAchievementIds.has(allAchievements.find(a => a.title === multiStreakAchievementToProcess.title)?.id)) {
        const [userHabits] = await connection.query('SELECT streak FROM habits WHERE user_id = ?', [userId]);
        qualifyingStreaksCount = userHabits.filter(h => h.streak >= multiStreakAchievementToProcess.streak_threshold).length;
    }

    for (const achievementToProcess of achievementsToProcess) {
      const achievementDetail = allAchievements.find(a => a.title === achievementToProcess.title);
      if (!achievementDetail || unlockedAchievementIds.has(achievementDetail.id)) {
        continue; // Skip if achievement doesn't exist or already unlocked
      }

      let conditionMet = false;
      if (achievementToProcess.type === 'streak') {
        console.log(`[DEBUG] Checking STREAK achievement: "${achievementToProcess.title}", required: ${achievementToProcess.value}, current habit streak: ${currentStreak}`);
        if (currentStreak >= achievementToProcess.value) {
          conditionMet = true;
          console.log(`[DEBUG] STREAK condition MET for "${achievementToProcess.title}"`);
        }
      } else if (achievementToProcess.type === 'habit_completions') { 
        console.log(`[DEBUG] Checking TOTAL LOGS achievement: "${achievementToProcess.title}", required: ${achievementToProcess.value}, total user logs: ${totalUserLogsCount}`);
        if (totalUserLogsCount >= achievementToProcess.value) {
          conditionMet = true;
          console.log(`[DEBUG] TOTAL LOGS condition MET for "${achievementToProcess.title}"`);
        }
      } else if (achievementToProcess.type === 'first_log_ever') {
        console.log(`[DEBUG] Checking FIRST LOG EVER achievement: "${achievementToProcess.title}", total user logs: ${totalUserLogsCount}`);
        if (totalUserLogsCount === 1) {
          conditionMet = true;
          console.log(`[DEBUG] FIRST LOG EVER condition MET for "${achievementToProcess.title}"`);
        }
      } else if (achievementToProcess.type === 'distinct_categories') {
        console.log(`[DEBUG] Checking DISTINCT CATEGORIES achievement: "${achievementToProcess.title}", required: ${achievementToProcess.value}, user distinct categories: ${distinctLoggedCategoriesCount}`);
        if (distinctLoggedCategoriesCount >= achievementToProcess.value) {
          conditionMet = true;
          console.log(`[DEBUG] DISTINCT CATEGORIES condition MET for "${achievementToProcess.title}"`);
        }
      } else if (achievementToProcess.type === 'multiple_streaks' && 
                 qualifyingStreaksCount >= achievementToProcess.habit_count_threshold) {
        console.log(`[DEBUG] Checking MULTIPLE STREAKS achievement: "${achievementToProcess.title}", required habits: ${achievementToProcess.habit_count_threshold} with streak >= ${achievementToProcess.streak_threshold}, user qualifying streaks: ${qualifyingStreaksCount}`);
        conditionMet = true;
        console.log(`[DEBUG] MULTIPLE STREAKS condition MET for "${achievementToProcess.title}"`);
      }

      if (conditionMet) {
        await connection.query(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievementDetail.id]
        );
        newlyUnlockedAchievements.push({ 
            id: achievementDetail.id, 
            title: achievementDetail.title,
            description: achievementDetail.description 
        });
        unlockedAchievementIds.add(achievementDetail.id); // Add to set to prevent re-awarding in same request if multiple achievements are hit
      }
    }
    // --- End Achievement Checking Logic ---

    await connection.commit(); // Commit transaction

    res.status(201).json({ 
      message: 'Habit logged successfully', 
      logId: newLogId, 
      newStreak: currentStreak,
      totalCompletions: newTotalCompletionsForThisHabit,
      unlockedAchievements: newlyUnlockedAchievements 
    });

  } catch (error) {
    if (connection) await connection.rollback(); // Rollback transaction on error
    console.error('Error logging habit completion:', error);
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('habit_logs')) { // Be more specific for DUP_ENTRY if possible
        return res.status(409).json({ message: 'Habit already logged for this period or entry already exists.' });
    }
    res.status(500).json({ message: 'Error logging habit completion', error: error.message });
  } finally {
    if (connection) connection.release(); // Release connection in all cases
  }
};

// GET /api/habits/:id/logs - Get all logs for a specific habit
export const getHabitLogs = async (req, res) => {
  const { id: habitId } = req.params;
  const userId = req.user.id;

  try {
    // First, verify the habit exists and belongs to the user
    const [habitRows] = await pool.query('SELECT id FROM habits WHERE id = ? AND user_id = ?', [habitId, userId]);
    if (habitRows.length === 0) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }

    // Fetch the logs for this habit
    const [logs] = await pool.query(
      'SELECT id, habit_id, user_id, completed_at FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY completed_at DESC',
      [habitId, userId]
    );

    res.status(200).json(logs);

  } catch (error) {
    console.error('Error fetching habit logs:', error);
    res.status(500).json({ message: 'Error fetching habit logs', error: error.message });
  }
}; 