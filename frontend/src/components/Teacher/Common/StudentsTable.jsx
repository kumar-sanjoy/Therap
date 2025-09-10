import React from 'react';
import { FaTrophy, FaStar, FaLightbulb, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import PerformanceIndicator from './PerformanceIndicator';

const StudentsTable = ({ students, onStudentClick, sortBy, sortOrder, onSort }) => {
  const getPerformanceLevel = (student) => {
    const percentage = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
    if (percentage >= 80) return { level: "excellent", color: "green", icon: FaTrophy };
    if (percentage >= 50) return { level: "good", color: "blue", icon: FaStar };
    return { level: "needs-improvement", color: "red", icon: FaLightbulb };
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-900 dark:text-white';
    if (percentage >= 50) return 'text-blue-900 dark:text-white';
    return 'text-red-900 dark:text-white';
  };

  const getPerformanceBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-200 dark:bg-green-900 border-2 border-green-300 dark:border-green-700';
    if (percentage >= 50) return 'bg-blue-200 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700';
    return 'bg-red-200 dark:bg-red-900 border-2 border-red-300 dark:border-red-700';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => onSort('studentId')}
              >
                <div className="flex items-center gap-2">
                  Student
                  {getSortIcon('studentId')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => onSort('performance')}
              >
                <div className="flex items-center gap-2">
                  Performance
                  {getSortIcon('performance')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => onSort('totalQuestions')}
              >
                <div className="flex items-center gap-2">
                  Questions
                  {getSortIcon('totalQuestions')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Correct
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Accuracy
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {students.map((student, index) => {
              const percentage = student.totalQuestions > 0 ? Math.round((student.correctAnswers / student.totalQuestions) * 100) : 0;
              const performance = getPerformanceLevel(student);
              const PerformanceIcon = performance.icon;
              
              return (
                <tr 
                  key={student.studentId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onStudentClick(student.studentId)}
                >
                  {/* Student Info */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        performance.color === 'green' ? 'bg-green-100' : 
                        performance.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        <PerformanceIcon className={`text-sm ${
                          performance.color === 'green' ? 'text-green-600' : 
                          performance.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name || student.studentId}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {student.studentId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Performance Circle */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      <PerformanceIndicator 
                        correct={student.correctAnswers} 
                        total={student.totalQuestions} 
                        size="sm" 
                      />
                    </div>
                  </td>

                  {/* Total Questions */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.totalQuestions}
                  </td>

                  {/* Correct Answers */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.correctAnswers}
                  </td>

                  {/* Accuracy */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceBgColor(percentage)} ${getPerformanceColor(percentage)}`}>
                      {percentage}%
                    </span>
                  </td>

                  {/* Performance Level */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <PerformanceIcon className={`text-sm mr-2 ${
                        performance.color === 'green' ? 'text-green-600 dark:text-green-300' : 
                        performance.color === 'blue' ? 'text-blue-600 dark:text-blue-300' : 'text-red-600 dark:text-red-300'
                      }`} />
                      <span className={`text-sm font-bold capitalize ${
                        performance.color === 'green' ? 'text-green-600 dark:text-green-300' : 
                        performance.color === 'blue' ? 'text-blue-600 dark:text-blue-300' : 'text-red-600 dark:text-red-300'
                      }`}>
                        {performance.level.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Click on any row to view detailed analysis
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;
