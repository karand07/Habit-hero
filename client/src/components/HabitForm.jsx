import { useState, useEffect } from 'react'

const categories = [
  'Health',
  'Fitness',
  'Mindfulness',
  'Learning',
  'Productivity',
  'Finance',
  'Social',
  'Other',
]

const frequencies = ['Daily', 'Weekly', 'Monthly']
const timesOfDay = ['Morning', 'Afternoon', 'Evening', 'Any Time']

export default function HabitForm({ habit, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Health',
    frequency: 'Daily',
    timeOfDay: 'Any Time',
  })

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        timeOfDay: habit.timeOfDay,
      })
    }
  }, [habit])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 dark:border-secondary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-700 dark:text-white dark:placeholder-secondary-400"
            placeholder="e.g., Morning Meditation"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 dark:border-secondary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-700 dark:text-white dark:placeholder-secondary-400"
            placeholder="What do you want to achieve with this habit?"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-secondary-600 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:bg-secondary-700 dark:text-white"
        >
          {categories.map((category) => (
            <option key={category} value={category} className="dark:bg-secondary-700 dark:text-white">
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="frequency"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Frequency
          </label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-secondary-600 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:bg-secondary-700 dark:text-white"
          >
            {frequencies.map((frequency) => (
              <option key={frequency} value={frequency} className="dark:bg-secondary-700 dark:text-white">
                {frequency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="timeOfDay"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Time of Day
          </label>
          <select
            id="timeOfDay"
            name="timeOfDay"
            value={formData.timeOfDay}
            onChange={(e) =>
              setFormData({ ...formData, timeOfDay: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-secondary-600 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:bg-secondary-700 dark:text-white"
          >
            {timesOfDay.map((time) => (
              <option key={time} value={time} className="dark:bg-secondary-700 dark:text-white">
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus-visible:outline-offset-secondary-800"
        >
          {habit ? 'Save Changes' : 'Create Habit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-secondary-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-secondary-500 hover:bg-gray-50 dark:hover:bg-secondary-500 sm:col-start-1 sm:mt-0"
        >
          Cancel
        </button>
      </div>
    </form>
  )
} 