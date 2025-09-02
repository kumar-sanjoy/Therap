import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorDisplay = ({ error, title = "Error" }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
      <div className="p-2 bg-red-100 rounded-xl">
        <FaExclamationTriangle className="text-red-500 text-lg" />
      </div>
      <div className="min-w-0">
        <h4 className="text-red-800 font-medium">{title}</h4>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
