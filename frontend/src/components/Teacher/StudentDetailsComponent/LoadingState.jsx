import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingState = ({ isRefreshing = false }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-xl animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {isRefreshing ? 'Regenerating Analysis' : 'Generating Analysis'}
      </h3>
      <p className="text-gray-500">
        {isRefreshing 
          ? 'Updating student performance analysis and recommendations...' 
          : 'Analyzing student performance and generating recommendations...'}
      </p>
    </div>
  );
};

export default LoadingState;
