import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import Modal from '../components/Modal'
import HabitForm from '../components/HabitForm'
import {
  getHabits as apiGetHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  logHabitCompletion as apiLogHabitCompletion,
} from '../services/api'
import { toast } from 'react-toastify'

const categories = [
  'All',
  'Health',
  'Fitness',
  'Mindfulness',
  'Learning',
  'Productivity',
  'Finance',
  'Social',
  'Other',
]

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)

  const fetchHabits = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await apiGetHabits()
      setHabits(data)
    } catch (err) {
      toast.error(err.message || 'Failed to fetch habits')
      setHabits([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter(habit => habit.category === selectedCategory)

  const handleDelete = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await apiDeleteHabit(habitId)
        toast.success('Habit deleted successfully!')
        fetchHabits()
      } catch (err) {
        toast.error(err.message || 'Failed to delete habit')
      }
    }
  }

  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingHabit) {
        await apiUpdateHabit(editingHabit.id, formData)
        toast.success('Habit updated successfully!')
      } else {
        await apiCreateHabit(formData)
        toast.success('Habit created successfully!')
      }
      fetchHabits()
      setIsModalOpen(false)
      setEditingHabit(null)
    } catch (err) {
      toast.error(err.message || (editingHabit ? 'Failed to update habit' : 'Failed to create habit'))
    }
  }

  const handleLogCompletion = async (habitId) => {
    try {
      const response = await apiLogHabitCompletion(habitId)
      setHabits(prevHabits => prevHabits.map(h => 
        h.id === habitId 
          ? { ...h, streak: response.newStreak, total_completions: response.totalCompletions, is_completed_today: true }
          : h
      ))
      toast.success('Habit logged successfully!');

      if (response.unlockedAchievements && response.unlockedAchievements.length > 0) {
        response.unlockedAchievements.forEach(ach => {
          toast.info(`Achievement Unlocked: ${ach.title}!`, { autoClose: 7000 })
        })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to log habit completion')
    }
  }

  if (isLoading) {
    return <div className="text-center py-10 dark:text-gray-300">Loading habits...</div>
  }

  return (
    <>
      <Helmet>
        <title>Habits - HabitHero</title>
      </Helmet>

      <div className="py-6 dark:bg-secondary-900 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Habits</h1>
            <button
              onClick={() => {
                setEditingHabit(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Habit
            </button>
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-700 dark:text-primary-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-secondary-700 dark:text-secondary-200 dark:hover:bg-secondary-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHabits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white dark:bg-secondary-800 overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-secondary-700"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {habit.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLogCompletion(habit.id)}
                        title="Log Completion"
                        className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 disabled:opacity-50"
                        disabled={habit.is_completed_today}
                      >
                        <CheckCircleIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleEdit(habit)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {habit.description}
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-700 dark:text-primary-100">
                      {habit.category}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-secondary-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Streak:</span>{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {habit.streak} days
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Total:</span>{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {habit.total_completions}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {habit.frequency} • {habit.time_of_day}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredHabits.length === 0 && (
            <div className="text-center mt-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h32M8 24h32M8 36h16"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No habits</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedCategory === 'All'
                  ? 'Get started by creating a new habit'
                  : `No habits found in ${selectedCategory} category`}
              </p>
              {selectedCategory === 'All' && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditingHabit(null)
                      setIsModalOpen(true)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Habit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingHabit(null)
        }}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      >
        <HabitForm
          onSubmit={handleSubmit}
          initialData={editingHabit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingHabit(null)
          }}
        />
      </Modal>
    </>
  )
} 