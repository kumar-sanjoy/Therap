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
      className={`bg-white rounded-2xl shadow-lg border-2 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-4 sm:p-6 
        ${performance.color === 'green' ? 'border-green-100 hover:border-green-300' : 
          performance.color === 'blue' ? 'border-blue-100 hover:border-blue-300' : 
          'border-red-100 hover:border-red-300'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
            performance.color === 'green' ? 'bg-green-100' : 
            performance.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
          }`}>
            <FaUserGraduate className={`text-sm sm:text-lg ${
              performance.color === 'green' ? 'text-green-600' : 
              performance.color === 'blue' ? 'text-blue-600' : 'text-red-600'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 truncate">{student.name || student.studentId}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">ID: {student.studentId}</p>
          </div>
        </div>
        <div className={`p-2 rounded-full flex-shrink-0 ${
          performance.color === 'green' ? 'bg-green-100' : 
          performance.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
        }`}>
          <PerformanceIcon className={`text-xs sm:text-sm ${
            performance.color === 'green' ? 'text-green-600' : 
            performance.color === 'blue' ? 'text-blue-600' : 'text-red-600'
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
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{student.totalQuestions}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Questions</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-green-600">{student.correctAnswers}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Correct</p>
        </div>
      </div>

      {/* Performance Badge */}
      <div className={`text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium ${
        performance.color === 'green' ? 'bg-green-100 text-green-700' : 
        performance.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
      }`}>
        {performance.level === 'excellent' ? 'Excellent Performance' :
         performance.level === 'mediocre' ? 'Mediocre Performance' : 'Needs Support'}
      </div>

      {/* View Details Button */}
      {showViewButton && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors duration-200 font-medium text-sm">
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
