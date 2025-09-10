import React from 'react';
import { Trophy, Target, ArrowRight, Clock, CheckCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompletionModal = ({ 
  showCompletionModal, 
  setShowCompletionModal, 
  readingTime, 
  lessonData, 
  formatTime, 
  setCurrentChunkIndex, 
  setMessages, 
  setIsCompleted, 
  setCompletedChunks 
}) => {
  const navigate = useNavigate();

  if (!showCompletionModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto shadow-2xl border border-gray-100 dark:border-gray-700">
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Animated Trophy Icon */}
          <div className="relative mx-auto mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white drop-shadow-md" />
            </div>
            {/* Floating Stars */}
            <div className="absolute -top-2 -right-2">
              <Star className="w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute -bottom-1 -left-1">
              <Star className="w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Chapter Complete! 🎉
          </h2>
          
          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2 sm:px-4 leading-relaxed">
            Congratulations! You've successfully completed this chapter. Great job on your learning journey!
          </p>
        </div>

        {/* Stats Section */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Reading Time */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Reading Time</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-blue-600 dark:text-blue-400">{formatTime(readingTime)}</span>
          </div>
          
          {/* Sections Completed */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Sections Completed</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-green-600 dark:text-green-400">
              {lessonData.content.length}/{lessonData.content.length}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4">
          {/* Review Again Button */}
          <button
            onClick={() => {
              setShowCompletionModal(false);
              setCurrentChunkIndex(0);
              setMessages([{ type: 'content', text: lessonData.content[0], timestamp: new Date(), sectionIndex: 0 }]);
              setIsCompleted(false);
              setCompletedChunks(new Set([0]));
            }}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm sm:text-base border border-gray-200 dark:border-gray-600 hover:shadow-md"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Review Again
            </span>
          </button>
          
          {/* Take Quiz Button */}
          <button
            onClick={() => {
              navigate('/quiz', {
                state: {
                  class: lessonData.class,
                  subject: lessonData.subject,
                  chapter: lessonData.chapter,
                  chapterTitle: lessonData.chapterTitle,
                  fromLearn: true
                }
              });
            }}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Take Quiz
            </span>
          </button>
          
          {/* Back to Dashboard Button */}
          <button
            onClick={() => navigate('/main')}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              Back to Dashboard
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </button>
        </div>

        {/* Close Button for Mobile */}
        <button
          onClick={() => setShowCompletionModal(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CompletionModal;
