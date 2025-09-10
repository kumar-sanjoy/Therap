import React from 'react';
import { FaTrophy, FaStar, FaLightbulb, FaUserGraduate, FaEye } from 'react-icons/fa';
import PerformanceIndicator from './PerformanceIndicator';

const StudentCard = ({ student, onClick, showViewButton = true }) => {
  const percentage = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
  
  const getPerformanceLevel = (percent) => {
    if (percent >= 80) return { level: "excellent", color: "green", icon: FaTrophy };
    if (percent >= 50) return { level: "mediocre", color: "blue", icon: FaStar };
    return { level: "needs-improvement", color: "red", icon: FaLightbulb };
  };

  const performance = getPerformanceLevel(percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div 
      onClick={() => onClick(student.studentId)}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 border-2 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-4 sm:p-6 
        ${performance.color === 'green' ? 'border-green-100 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-600' : 
          performance.color === 'blue' ? 'border-blue-100 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600' : 
          'border-red-100 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-600'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
            performance.color === 'green' ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700' : 
            performance.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' : 'bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700'
          }`}>
            <FaUserGraduate className={`text-sm sm:text-lg ${
              performance.color === 'green' ? 'text-green-700 dark:text-green-900' : 
              performance.color === 'blue' ? 'text-blue-700 dark:text-blue-900' : 'text-red-700 dark:text-red-900'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white truncate">{student.name || student.studentId}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">ID: {student.studentId}</p>
          </div>
        </div>
        <div className={`p-2 rounded-full flex-shrink-0 ${
          performance.color === 'green' ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700' : 
          performance.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' : 'bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700'
        }`}>
          <PerformanceIcon className={`text-xs sm:text-sm ${
            performance.color === 'green' ? 'text-green-700 dark:text-green-900' : 
            performance.color === 'blue' ? 'text-blue-700 dark:text-blue-900' : 'text-red-700 dark:text-red-900'
          }`} />
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-4">
        <PerformanceIndicator 
          correct={student.correctAnswers} 
          total={student.totalQuestions} 
          size="lg" 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{student.totalQuestions}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Questions</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{student.correctAnswers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Correct</p>
        </div>
      </div>

      {/* Performance Badge */}
      <div className={`text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-bold shadow-md ${
        performance.color === 'green' ? 'bg-green-300 dark:bg-green-900 text-green-900 dark:text-white border-2 border-green-400 dark:border-green-700' : 
        performance.color === 'blue' ? 'bg-blue-300 dark:bg-blue-900 text-blue-900 dark:text-white border-2 border-blue-400 dark:border-blue-700' : 'bg-red-300 dark:bg-red-900 text-red-900 dark:text-white border-2 border-red-400 dark:border-red-700'
      }`}>
        {performance.level === 'excellent' ? 'Excellent Performance' :
         performance.level === 'mediocre' ? 'Mediocre Performance' : 'Needs Support'}
      </div>

      {/* View Details Button */}
      {showViewButton && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors duration-200 font-medium text-sm">
            <FaEye className="text-sm" />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentCard;
