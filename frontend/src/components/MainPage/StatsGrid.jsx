import React from 'react';
import { FaGraduationCap, FaTrophy, FaStar } from 'react-icons/fa';

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Questions</h3>
          <FaGraduationCap className="text-2xl text-emerald-500" />
        </div>
        <p className="text-4xl font-bold text-[#343434] dark:text-gray-100">{stats.totalQuestions}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Questions attempted</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Correct Answers</h3>
          <FaTrophy className="text-2xl text-yellow-500" />
        </div>
        <p className="text-4xl font-bold text-green-600">{stats.totalRight}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Right answers</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Accuracy</h3>
          <FaStar className="text-2xl text-blue-500" />
        </div>
        <p className="text-4xl font-bold text-blue-600">
          {stats.totalQuestions > 0 ? Math.round((stats.totalRight / stats.totalQuestions) * 100) : 0}%
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Success rate</p>
      </div>
    </div>
  );
};

export default StatsGrid;
