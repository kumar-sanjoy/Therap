import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorState = ({ error, onRetry, studentId }) => {
  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-100 rounded-xl">
          <FaExclamationTriangle className="text-red-500 text-lg" />
        </div>
        <div className="flex-1">
          <h4 className="text-red-800 font-semibold mb-2">Error Loading Analysis</h4>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => onRetry(studentId, true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
