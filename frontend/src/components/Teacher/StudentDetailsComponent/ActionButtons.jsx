import React from 'react';

const ActionButtons = ({ onClose, onRefresh, studentId }) => {
  return (
    <div className="flex gap-4 pt-4">
      <button
        onClick={onClose}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        Close Report
      </button>
      <button
        onClick={() => onRefresh(studentId, true)}
        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl transition-all duration-300 font-medium"
      >
        Refresh Analysis
      </button>
    </div>
  );
};

export default ActionButtons;
