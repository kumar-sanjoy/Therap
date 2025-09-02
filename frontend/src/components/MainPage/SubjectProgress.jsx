import React from 'react';
import { FaChartLine } from 'react-icons/fa';

const SubjectProgress = ({ stats, isDarkMode }) => {
  return (
    <div className={`rounded-2xl shadow-lg border p-6 mb-8 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${
          isDarkMode ? 'text-gray-100' : 'text-[#343434]'
        }`}>Subject Progress</h2>
        <FaChartLine className="text-2xl text-emerald-500" />
      </div>
      <div className="space-y-6">
        {(() => {
          console.log('🔍 [MAIN_PAGE DEBUG] Rendering subjects:', {
            subjectsObject: stats.subjects,
            subjectsKeys: Object.keys(stats.subjects),
            subjectsEntries: Object.entries(stats.subjects)
          });
          return Object.entries(stats.subjects).map(([subject, data]) => (
            <div key={subject} className={`flex items-center justify-between p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div>
                <h3 className={`font-semibold capitalize text-lg ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>{subject}</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{data.completed} questions completed</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-32 rounded-full h-3 ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${data.accuracy}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-emerald-600">{data.accuracy}%</span>
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

export default SubjectProgress;
