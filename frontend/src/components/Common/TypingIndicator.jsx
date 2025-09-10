import React from 'react';
import { useDarkTheme } from './DarkThemeProvider';
import teacherImage from '../../assets/teacher.jpg';

const TypingIndicator = ({ isVisible = false }) => {
  const { isDarkMode } = useDarkTheme();

  if (!isVisible) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 mb-4">
      <div className="flex items-start gap-3">
        {/* Teacher Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-500">
          <img 
            src={teacherImage} 
            alt="AI Teacher" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Typing Indicator */}
        <div className="flex-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 border border-indigo-200 dark:border-indigo-700 rounded-2xl p-4 relative">
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              Teacher is typing...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
