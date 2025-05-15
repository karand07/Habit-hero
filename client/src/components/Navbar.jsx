import { Link, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { HomeIcon, UserGroupIcon, ChartBarIcon, TrophyIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme(); // Use the theme context

  const navLinkClass = ({ isActive }) =>
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'border-b-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
        : 'text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 hover:border-b-2 hover:border-primary-600 dark:hover:border-primary-400 border-b-2 border-transparent'
    }`;

  const mobileNavLinkClass = ({ isActive }) => 
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive 
        ? 'bg-primary-700 text-white' 
        : 'text-gray-300 hover:bg-primary-600 hover:text-white dark:text-gray-300 dark:hover:bg-secondary-700'
    }`;

  return (
    <nav className="bg-white dark:bg-secondary-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-primary-600 dark:text-primary-400 text-xl font-bold transition-colors duration-200">
              HabitHero
            </Link>
            {user && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <NavLink to="/dashboard" className={navLinkClass}>
                    <ChartBarIcon className="h-5 w-5 mr-2" /> Dashboard
                  </NavLink>
                  <NavLink to="/habits" className={navLinkClass}>
                    <HomeIcon className="h-5 w-5 mr-2" /> Habits
                  </NavLink>
                  <NavLink to="/achievements" className={navLinkClass}>
                    <TrophyIcon className="h-5 w-5 mr-2" /> Achievements
                  </NavLink>
                   <NavLink to="/stats" className={navLinkClass}>
                     <UserGroupIcon className="h-5 w-5 mr-2" /> Stats
                   </NavLink>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={toggleTheme} 
                className="p-1 rounded-full text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800"
              >
                <span className="sr-only">Toggle theme</span>
                {theme === 'light' ? (
                  <MoonIcon className="h-6 w-6" />
                ) : (
                  <SunIcon className="h-6 w-6" />
                )}
              </button>
              {user ? (
                <>
                  <NavLink to="/profile" className={`${navLinkClass({isActive: false})} ml-3`}> {/* Ensure navLinkClass is called correctly if it expects an object */}
                    <UserCircleIcon className="h-5 w-5 mr-2" /> Profile
                  </NavLink>
                  <button
                    onClick={logout}
                    className="ml-3 flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-primary-100 dark:hover:bg-secondary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" /> Logout
                  </button>
                </>
              ) : (
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
              )}
            </div>
          </div>
          {/* Mobile menu button - you might want to style this for dark mode too */}
          {/* ... other mobile menu code ... */}
        </div>
      </div>
       {/* Mobile menu, if open */} 
       {/* You'll need to handle the open/close state for mobile menu and apply dark mode styles here as well */}
    </nav>
  );
} 