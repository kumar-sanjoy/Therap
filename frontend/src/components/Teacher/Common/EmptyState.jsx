import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  showClearButton = false, 
  onClearClick,
  showRefreshButton = false,
  onRefreshClick
}) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
      <div className="mb-6">
        <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="text-3xl text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-500">
          {message}
        </p>
      </div>
      {(showClearButton || showRefreshButton) && (
        <div className="flex gap-3 justify-center">
          {showClearButton && (
            <button
              onClick={onClearClick}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              Clear Search
            </button>
          )}
          {showRefreshButton && (
            <button
              onClick={onRefreshClick}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              Refresh Data
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
