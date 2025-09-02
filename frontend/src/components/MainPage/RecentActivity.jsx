import React from 'react';
import { 
  FaHistory, FaArrowUp, FaArrowDown, FaMinus, FaCheckCircle, 
  FaTimesCircle, FaTrophy, FaAward, FaBook, FaRegSmile, 
  FaRegFrown, FaRegMeh, FaBullseye, FaLightbulb 
} from 'react-icons/fa';

const RecentActivity = ({ stats, isDarkMode }) => {
  return (
    <div className={`rounded-2xl shadow-lg border p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-gray-100' : 'text-[#343434]'
          }`}>Recent Performance</h2>
          {/* Performance trend indicator - only show if there are recent performances */}
          {stats.lastTenPerformance.length >= 10 && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length >= 3
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 shadow-sm'
                : stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length <= 1
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 shadow-sm'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 shadow-sm'
            }`}>
              {stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length >= 3 ? (
                <FaArrowUp className="text-green-600 dark:text-green-400" />
              ) : stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length <= 1 ? (
                <FaArrowDown className="text-red-600 dark:text-red-400" />
              ) : (
                <FaMinus className="text-yellow-600 dark:text-yellow-400" />
              )}
              {stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length >= 3 ? 'Improving' : 
               stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length <= 1 ? 'Needs Focus' : 'Stable'}
            </div>
          )}
        </div>
        <FaHistory className="text-2xl text-indigo-500" />
      </div>

      {/* Performance Timeline */}
      <div className="space-y-6">
        {/* Visual Performance Chain */}
        {stats.lastTenPerformance.length === 0 || stats.totalQuestions === 0 ? (
          // New Student Welcome Message
          <div className={`p-8 rounded-xl transition-all duration-300 text-center ${
            isDarkMode ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-700/30' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200'
          }`}>
            <div className="mb-4">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkMode ? 'text-indigo-200' : 'text-indigo-800'
              }`}>
                Ready to Start Your Journey?
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
              }`}>
                Your performance chart will appear here once you start learning and taking quizzes
              </p>
            </div>
          </div>
        ) : (
          // Existing Performance Chain for students with data
          <div className={`p-6 rounded-xl transition-all duration-300 ${
            isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/40' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            
            {/* Desktop View - Horizontal Chain */}
            <div className="hidden md:flex items-center justify-between relative">
              {stats.lastTenPerformance.map((result, index) => (
                <div key={index} className="flex flex-col items-center group relative">
                  {/* Connection Line */}
                  {index < stats.lastTenPerformance.length - 1 && (
                    <div className={`absolute w-8 h-0.5 mt-6 ml-8 transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                  
                  {/* Question Circle */}
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${
                    result === 'right' 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200 hover:shadow-emerald-300' 
                      : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-200 hover:shadow-red-300'
                  }`}>
                    {result === 'right' ? (
                      <FaCheckCircle className="text-lg" />
                    ) : (
                      <FaTimesCircle className="text-lg" />
                    )}
                  </div>
                  
                  {/* Question Number */}
                  <span className={`mt-2 text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    Q{index + 1}
                  </span>
                  
                  {/* Hover Tooltip */}
                  <div className={`absolute top-16 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-lg transform -translate-x-1/2 left-1/2`}>
                    <div className="flex items-center gap-2">
                      {result === 'right' ? (
                        <FaCheckCircle className="text-green-400" />
                      ) : (
                        <FaTimesCircle className="text-red-400" />
                      )}
                      <span>Question {index + 1}: {result === 'right' ? 'Correct' : 'Incorrect'}</span>
                    </div>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View - Grid Layout */}
            <div className="grid grid-cols-5 gap-3 md:hidden">
              {stats.lastTenPerformance.map((result, index) => (
                <div key={index} className="flex flex-col items-center group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 group-hover:scale-105 ${
                    result === 'right' 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                      : 'bg-gradient-to-br from-red-400 to-red-600'
                  }`}>
                    {result === 'right' ? (
                      <FaCheckCircle className="text-sm" />
                    ) : (
                      <FaTimesCircle className="text-sm" />
                    )}
                  </div>
                  <span className={`mt-1 text-xs transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    Q{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        {(() => {
          const correctAnswers = stats.lastTenPerformance.filter(r => r === 'right').length;
          const streak = stats.streak;
          const recentTrend = stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length;
          

          
          // Dynamic performance analysis for existing students
          let performanceLevel, emoji, title, message, borderColor, bgColor, textColor;
          
          // High performance scenarios
          if (correctAnswers >= 8 && streak >= 5) {
            performanceLevel = 'excellent';
            emoji = <FaTrophy className="text-2xl" />;
            title = 'Outstanding Performance!';
            message = `Amazing work! You've got ${correctAnswers}/10 correct and a ${streak}-day streak. You're on fire! 🔥`;
          } else if (correctAnswers >= 7 && streak >= 3) {
            performanceLevel = 'great';
            emoji = <FaAward className="text-2xl" />;
            title = 'Great Performance!';
            message = `Excellent progress! ${correctAnswers}/10 correct with a ${streak}-day streak. Keep this momentum going!`;
          } else if (correctAnswers >= 6 && recentTrend >= 3) {
            performanceLevel = 'improving';
            emoji = <FaArrowUp className="text-2xl" />;
            title = 'Improving Well!';
            message = `You're getting better! ${correctAnswers}/10 correct and improving in recent questions. Stay focused!`;
          }
          // Medium performance scenarios
          else if (correctAnswers >= 5 && streak >= 2) {
            performanceLevel = 'stable';
            emoji = <FaBook className="text-2xl" />;
            title = 'Steady Progress';
            message = `Good consistency! ${correctAnswers}/10 correct with a ${streak}-day streak. Keep practicing regularly.`;
          } else if (correctAnswers >= 4 && recentTrend >= 2) {
            performanceLevel = 'stable';
            emoji = <FaRegSmile className="text-2xl" />;
            title = 'Making Progress';
            message = `You're on the right track! ${correctAnswers}/10 correct. Focus on the areas you find challenging.`;
          }
          // Low performance scenarios - only show if there are at least 10 recent performances
          else if (stats.lastTenPerformance.length >= 10 && correctAnswers <= 2 && streak <= 1) {
            performanceLevel = 'needs-focus';
            emoji = <FaBullseye className="text-2xl" />;
            title = 'Time to Focus';
            message = `Let's turn this around! Only ${correctAnswers}/10 correct. Review the basics and try again. You've got this!`;
          } else if (stats.lastTenPerformance.length >= 10 && correctAnswers <= 3 && recentTrend <= 1) {
            performanceLevel = 'needs-focus';
            emoji = <FaRegFrown className="text-2xl" />;
            title = 'Needs Improvement';
            message = `Only ${correctAnswers}/10 correct recently. Take a break, review the material, and come back stronger!`;
          }
          // Default scenarios
          else if (stats.lastTenPerformance.length >= 10 && correctAnswers >= 4) {
            performanceLevel = 'stable';
            emoji = <FaRegMeh className="text-2xl" />;
            title = 'Keep Learning';
            message = `${correctAnswers}/10 correct. You're making progress! Focus on consistency and regular practice.`;
          } else if (stats.lastTenPerformance.length >= 10) {
            performanceLevel = 'needs-focus';
            emoji = <FaLightbulb className="text-2xl" />;
            title = 'Room for Growth';
            message = `${correctAnswers}/10 correct. Every expert was once a beginner. Keep practicing and don't give up!`;
          } else {
            // For students with less than 10 performances, show encouraging message
            performanceLevel = 'stable';
            emoji = <FaRegSmile className="text-2xl" />;
            title = 'Getting Started';
            message = `You've completed ${correctAnswers} questions so far. Keep going and build your learning momentum!`;
          }
          
          // Set colors based on performance level
          switch (performanceLevel) {
            case 'excellent':
              borderColor = 'border-green-500';
              bgColor = 'bg-green-50 dark:bg-green-900/20';
              textColor = 'text-green-700 dark:text-green-300';
              break;
            case 'great':
              borderColor = 'border-green-500';
              bgColor = 'bg-green-50 dark:bg-green-900/20';
              textColor = 'text-green-700 dark:text-green-300';
              break;
            case 'improving':
              borderColor = 'border-blue-500';
              bgColor = 'bg-blue-50 dark:bg-blue-900/20';
              textColor = 'text-blue-700 dark:text-blue-300';
              break;
            case 'stable':
              borderColor = 'border-yellow-500';
              bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
              textColor = 'text-yellow-700 dark:text-yellow-300';
              break;
            case 'needs-focus':
              borderColor = 'border-red-500';
              bgColor = 'bg-red-50 dark:bg-red-900/20';
              textColor = 'text-red-700 dark:text-red-300';
              break;
            default:
              borderColor = 'border-gray-500';
              bgColor = 'bg-gray-50 dark:bg-gray-900/20';
              textColor = 'text-gray-700 dark:text-gray-300';
          }
          
          return (
            <div className={`p-4 rounded-xl border-l-4 ${borderColor} ${bgColor}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{emoji}</div>
                <div>
                  <h4 className={`font-semibold ${textColor}`}>
                    {title}
                  </h4>
                  <p className={`text-sm mt-1 ${textColor.replace('700', '600').replace('300', '400')}`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default RecentActivity;
