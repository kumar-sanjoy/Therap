import React from 'react';
import { FaChartLine, FaBrain, FaLightbulb, FaSpinner } from 'react-icons/fa';

const LoadingState = ({ isRefreshing = false }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Simplified Loading Animation */}
      <div className="relative mb-6">
        {/* Main spinner */}
        <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
        
        {/* Central icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <FaChartLine className="text-indigo-600 dark:text-indigo-400 text-lg" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center max-w-sm">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {isRefreshing ? 'Regenerating Analysis' : 'Generating Analysis'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {isRefreshing 
            ? 'Updating student performance analysis...' 
            : 'Analyzing student performance and generating recommendations...'}
        </p>
      </div>

      {/* Simple Progress Indicator */}
      <div className="mt-6 flex items-center space-x-2">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingState;
