import React from 'react';
import { CheckCircle, BookOpen, Trophy, Clock, Target, Award } from 'lucide-react';

const Sidebar = ({ 
  lessonData, 
  currentChunkIndex, 
  progressPercentage, 
  isCompleted, 
  readingTime, 
  formatTime, 
  handleJumpToChunk 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Learning Progress</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {isCompleted && (
          <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Chapter Complete!</span>
          </div>
        )}
      </div>

      {/* Chapter Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Lesson Sections
          </h3>
        </div>
        <div className="space-y-2">
          {lessonData.content.map((_, index) => {
            const isCurrentSection = currentChunkIndex === index;
            const isCompletedSection = index <= currentChunkIndex;
            
            return (
              <button
                key={index}
                onClick={() => handleJumpToChunk(index)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  isCurrentSection
                    ? 'bg-indigo-100 dark:bg-indigo-900 border-l-4 border-indigo-500 shadow-md'
                    : isCompletedSection
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrentSection
                        ? 'bg-indigo-500 text-white'
                        : isCompletedSection
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {isCompletedSection ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm font-medium ${
                      isCurrentSection
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : isCompletedSection
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Section {index + 1}
                    </span>
                  </div>
                  {isCurrentSection && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reading Time */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Study Time</span>
        </div>
        <div className="flex items-center space-x-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {formatTime(readingTime)}
          </span>
        </div>
        
      </div>

      {/* Completion Status */}
      {isCompleted && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-green-700 dark:text-green-300">Achievement Unlocked!</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            You've successfully completed all sections of this chapter. Great job, student! 🎉
          </p>
        </div>
      )}

      {/* Learning Tips */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">💡</span>
          </div>
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Learning Tips</span>
        </div>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
          <li>• Take your time to understand each section</li>
          <li>• Ask questions if something is unclear</li>
          <li>• Review completed sections for better retention</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
