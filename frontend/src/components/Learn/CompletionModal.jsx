import React from 'react';
import { Trophy, Target, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chapter Complete! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Congratulations! You've successfully completed this chapter.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-600 dark:text-gray-300">Reading Time</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatTime(readingTime)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-600 dark:text-gray-300">Sections Completed</span>
            <span className="font-semibold text-gray-900 dark:text-white">{lessonData.content.length}/{lessonData.content.length}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setShowCompletionModal(false);
              setCurrentChunkIndex(0);
              // Reset to initial state but keep conversation history and reading time
              setMessages([{ type: 'content', text: lessonData.content[0], timestamp: new Date(), sectionIndex: 0 }]);
              // Don't reset reading time - keep it running
              setIsCompleted(false);
              setCompletedChunks(new Set([0]));
            }}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Review Again
          </button>
          <button
            onClick={() => {
              // Navigate to Quiz with chapter information
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
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            Take Quiz
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/main')}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
