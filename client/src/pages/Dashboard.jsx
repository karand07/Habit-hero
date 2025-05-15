import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShareIcon as ShareIconOutline,
} from '@heroicons/react/24/outline'
import { getHabits as apiGetHabits } from '../services/api'
import ShareModal from '../components/ShareModal'

// Minimum streak value to show the share button
const MIN_STREAK_TO_SHARE = 1

export default function Dashboard() {
  const [habits, setHabits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Local state for UI-only completion toggle on dashboard
  // This does not interact with the backend `logHabitCompletion` for streaks/achievements
  // It's a simple visual toggle for the dashboard view of "today's habits"
  const [todayHabitCompletions, setTodayHabitCompletions] = useState({})

  // State for ShareModal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedItemToShare, setSelectedItemToShare] = useState(null) // Generic name

  const fetchAndPrepareHabits = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedHabits = await apiGetHabits()
      setHabits(fetchedHabits)
      // Initialize todayHabitCompletions based on the is_completed_today field from the backend
      const initialCompletions = {}
      fetchedHabits.forEach(h => initialCompletions[h.id] = h.is_completed_today || false)
      setTodayHabitCompletions(initialCompletions)

    } catch (err) {
      setError(err.message || 'Failed to fetch habits')
      setHabits([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAndPrepareHabits()
  }, [fetchAndPrepareHabits])

  const toggleTodayCompletion = (habitId) => {
    setTodayHabitCompletions(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }))
    // Note: This does NOT call the backend logHabitCompletion.
    // For actual logging that affects streaks and achievements, user should go to Habits page.
  }
  
  const completedTodayCount = habits.filter(h => todayHabitCompletions[h.id]).length
  const longestStreak = habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak)) : 0

  const handleOpenShareModal = (habit) => {
    setSelectedItemToShare(habit)
    setIsShareModalOpen(true)
  }

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false)
    setSelectedItemToShare(null)
  }

  if (isLoading) {
    return <div className="text-center py-10 dark:text-gray-300">Loading dashboard data...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - HabitHero</title>
      </Helmet>

      <div className="py-6 dark:bg-secondary-900 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-secondary-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Completed Today
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {completedTodayCount}/{habits.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-yellow-500 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Longest Current Streak
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {longestStreak} days
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Saved card is removed */}
          </div>

          {/* Habits List */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Today's Habits Quick Toggle</h2>
              <Link
                to="/habits"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800"
              >
                Manage Habits
              </Link>
            </div>

            {habits.length === 0 && !isLoading && (
                <div className="text-center mt-6 py-6 bg-white dark:bg-secondary-800 shadow rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No habits found. Go to the <Link to="/habits" className="text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300">Habits page</Link> to create some!</p>
                </div>
            )}

            {habits.length > 0 && (
                <div className="mt-4 bg-white dark:bg-secondary-800 shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-secondary-700">
                    {habits.map((habit) => (
                    <li key={habit.id}>
                        <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-grow">
                            <button
                                onClick={() => toggleTodayCompletion(habit.id)}
                                className={`flex-shrink-0 h-6 w-6 rounded-full ${
                                todayHabitCompletions[habit.id]
                                    ? 'text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-500'
                                    : 'text-gray-300 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400'
                                }`}
                            >
                                {todayHabitCompletions[habit.id] ? (
                                <CheckCircleIcon className="h-6 w-6" />
                                ) : (
                                <XCircleIcon className="h-6 w-6" />
                                )}
                            </button>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {habit.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{habit.category}</p>
                            </div>
                            </div>
                            <div className="flex items-center ml-4">
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Streak: {habit.streak}
                            </span>
                            {habit.streak >= MIN_STREAK_TO_SHARE && (
                                <button
                                onClick={() => handleOpenShareModal(habit)}
                                className="ml-2 p-1 rounded-full text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                title="Share Streak"
                                >
                                <ShareIconOutline className="h-5 w-5" />
                                <span className="sr-only">Share Streak</span>
                                </button>
                            )}
                            </div>
                        </div>
                        </div>
                    </li>
                    ))}
                </ul>
                </div>
            )}
          </div>
        </div>
      </div>

      {selectedItemToShare && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={handleCloseShareModal}
          modalTitle="Share Your Streak!"
          itemName={selectedItemToShare.title} // Habit title
          itemValue={selectedItemToShare.streak} // Streak value
          shareType="streak"
        />
      )}
    </>
  )
} 