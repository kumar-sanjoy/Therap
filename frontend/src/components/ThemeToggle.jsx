import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useDarkTheme } from './DarkThemeProvider';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDarkMode, toggleDarkMode } = useDarkTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        ${sizeClasses[size]}
        rounded-full 
        bg-gray-200 dark:bg-gray-700 
        hover:bg-gray-300 dark:hover:bg-gray-600 
        transition-all duration-300 
        flex items-center justify-center
        shadow-sm hover:shadow-md
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FaSun className={`${iconSizes[size]} text-yellow-500`} />
      ) : (
        <FaMoon className={`${iconSizes[size]} text-gray-600`} />
      )}
    </button>
  );
};

export default ThemeToggle; 