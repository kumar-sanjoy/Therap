import React from 'react';
import { FaTimes, FaUserGraduate } from 'react-icons/fa';

const ModalHeader = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <FaUserGraduate className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Student Analysis Report</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Detailed performance analysis and recommendations</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
      >
        <FaTimes className="text-gray-500 dark:text-gray-400 text-xl" />
      </button>
    </div>
  );
};

export default ModalHeader;
