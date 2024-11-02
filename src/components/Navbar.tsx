import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, BookMarked, Users, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: null },
    { path: '/journal', label: 'Journal', icon: BookMarked },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">DreamScape</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors
                  ${location.pathname === path
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{label}</span>
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-2 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                  ${location.pathname === path
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-600 dark:text-gray-300'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span>{label}</span>
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}