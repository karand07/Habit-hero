import pool from './database.js';

const achievements = [
  {
    title: 'First Habit Completed',
    description: 'Congratulations on completing your first habit task!',
    criteria: 'Log any habit for the first time.',
    icon_url: null,
  },
  {
    title: '3-Day Streak',
    description: 'Kept a habit going for 3 days straight!',
    criteria: 'Achieve a 3-day streak on any habit.',
    icon_url: null,
  },
  {
    title: '7-Day Streak',
    description: 'A full week of consistency with a habit!',
    criteria: 'Achieve a 7-day streak on any habit.',
    icon_url: null,
  },
  {
    title: 'Habitual Hero',
    description: 'Made 10 habit entries in total across all habits.',
    criteria: 'Complete 10 habit logs in total.',
    icon_url: null,
  },
  {
    title: 'Fortnight Focus',
    description: 'Maintained a habit streak for 15 days!',
    criteria: 'Achieve a 15-day streak on any habit.',
    icon_url: null,
  },
  {
    title: 'Month of Mastery',
    description: 'Maintained a habit streak for 30 days! Incredible dedication!',
    criteria: 'Achieve a 30-day streak on any habit.',
    icon_url: null,
  },
  {
    title: 'Golden Logger',
    description: 'Successfully logged 50 habit entries in total.',
    criteria: 'Complete 50 habit logs in total.',
    icon_url: null,
  },
  {
    title: 'Habit Veteran',
    description: 'Successfully logged 100 habit entries in total.',
    criteria: 'Complete 100 habit logs in total.',
    icon_url: null,
  },
  {
    title: 'Category Connoisseur',
    description: 'Completed at least one habit in 3 different categories.',
    criteria: 'Log habits in at least 3 distinct categories.',
    icon_url: null,
  },
  {
    title: 'All-Rounder',
    description: 'Maintain a 7-day streak on 3 different habits simultaneously.',
    criteria: 'Have a streak of 7+ days on 3 habits at the same time.',
    icon_url: null,
  }
];

async function seedAchievements() {
  try {
    console.log('Starting to seed achievements...');
    let seededCount = 0;

    for (const ach of achievements) {
      const [existing] = await pool.query(
        'SELECT id FROM achievements WHERE title = ?',
        [ach.title]
      );

      if (existing.length === 0) {
        const [result] = await pool.query(
          'INSERT INTO achievements (title, description, criteria, icon_url) VALUES (?, ?, ?, ?)',
          [ach.title, ach.description, ach.criteria, ach.icon_url]
        );
        console.log(`Inserted achievement: ${ach.title} (ID: ${result.insertId})`);
        seededCount++;
      } else {
        console.log(`Achievement already exists: ${ach.title} (ID: ${existing[0].id})`);
      }
    }

    if (seededCount > 0) {
      console.log(`Successfully seeded ${seededCount} new achievements.`);
    } else {
      console.log('All predefined achievements already exist in the database.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding achievements:', error);
    process.exit(1);
  }
}

seedAchievements(); 