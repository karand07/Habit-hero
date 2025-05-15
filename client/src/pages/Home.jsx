import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  ChartBarIcon, 
  TrophyIcon, 
  ShareIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Track Your Progress',
    description: 'Monitor your daily habits and see your progress over time with beautiful charts and visualizations.',
    icon: ChartBarIcon,
  },
  {
    name: 'Earn Achievements',
    description: 'Stay motivated with a gamified experience. Unlock achievements as you build better habits.',
    icon: TrophyIcon,
  },
  {
    name: 'Share Your Success',
    description: 'Celebrate your wins by sharing your achievements and streaks with friends and family.',
    icon: ShareIcon,
  },
  {
    name: 'Build Consistency',
    description: 'Track your streaks and get reminders to help you stay consistent with your habits.',
    icon: CalendarIcon,
  },
]

export default function Home() {
  return (
    <>
      <Helmet>
        <title>HabitHero - Build Better Habits</title>
        <meta
          name="description"
          content="HabitHero helps you build and maintain positive habits through gamification and social sharing."
        />
      </Helmet>

      <div className="bg-white dark:bg-secondary-900">
        {/* Header */}
        <header className="absolute inset-x-0 top-0 z-50">
          <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">HabitHero</span>
              </Link>
            </div>
            <div className="flex gap-x-6">
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Get started
              </Link>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero section */}
          <div className="relative isolate">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                  Build better habits,{' '}
                  <span className="text-primary-600 dark:text-primary-400">become your best self</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  HabitHero helps you create and maintain positive habits through an engaging,
                  gamified experience. Track your progress, earn achievements, and share your
                  success with others.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    to="/register"
                    className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Get started for free
                  </Link>
                  <Link
                    to="/login"
                    className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 dark:hover:text-primary-400"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feature section */}
          <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">
                Everything you need
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Features that help you succeed
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
                        <feature.icon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* CTA section */}
          <div className="mx-auto mt-32 max-w-7xl sm:mt-40 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-primary-600 dark:bg-primary-700 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start building better habits today
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300 dark:text-primary-100">
                Join thousands of others who are using HabitHero to transform their lives
                through the power of consistent habits.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/register"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-100 dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get started for free
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mx-auto mt-32 max-w-7xl px-6 pb-8 lg:px-8">
          <div className="border-t border-gray-900/10 dark:border-gray-100/10 pt-8">
            <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} HabitHero. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
} 