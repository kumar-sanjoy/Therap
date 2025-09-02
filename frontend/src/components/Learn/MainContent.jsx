import React from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle, RotateCcw, ZoomIn, ZoomOut, Trophy, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';
import TextDisplay from '../Common/TextDisplay';
import TypewriterEffect from '../Common/TypewriterEffect';
import TypingIndicator from '../Common/TypingIndicator';
import TeacherLoadingScreen from '../Common/TeacherLoadingScreen';
import teacherImage from '../../assets/teacher.jpg';

const MainContent = ({
  lessonData,
  currentChunkIndex,
  messages,
  isLoading,
  isLoadingLesson,
  lessonError,
  error,
  showTypingIndicator,
  fontSize,
  setFontSize,
  handlePrevious,
  handleNext,
  handleCompleteChapter,
  isCompleted,
  messagesEndRef
}) => {
  const TypingIndicatorComponent = () => (
    <div className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-700 rounded-2xl max-w-20 shadow-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  // Helper function to get teacher message styling based on message type
  const getTeacherMessageStyle = (msg) => {
    if (msg.type === 'content') {
      return 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700';
    } else if (msg.type === 'bot') {
      return 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700';
    }
    return 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200 dark:border-indigo-700';
  };

  // Helper function to get teacher icon based on message type
  const getTeacherIcon = (msg) => {
    if (msg.type === 'content') {
      return <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    } else if (msg.type === 'bot') {
      return <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
    return <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}
      
      {lessonError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-300">{lessonError}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoadingLesson && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <TeacherLoadingScreen 
            message="Teacher is preparing your lesson content..."
            size="large"
          />
        </div>
      )}

      {/* Chat Messages */}
      {!isLoadingLesson && lessonData.content.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-scale-in">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Interactive Learning Session
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your AI teacher is here to guide you through this chapter step by step.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentChunkIndex === 0}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous section"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Section {currentChunkIndex + 1} of {lessonData.content.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentChunkIndex + 1 >= lessonData.content.length}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next section"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                
                {/* Complete Chapter Button - only show on last section */}
                {currentChunkIndex === lessonData.content.length - 1 && !isCompleted && (
                  <button
                    onClick={handleCompleteChapter}
                    className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    title="Complete chapter"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </button>
                )}
              </div>
              
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="px-2 text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {msg.type === 'user' ? (
                  // User message (right side) - Student asking questions
                  <div className="max-w-[85%] min-w-0 p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">👤</span>
                      </div>
                      <span className="text-xs font-medium opacity-80">You</span>
                    </div>
                    <div style={{ fontSize: `${fontSize}px` }} className="w-full max-w-full min-w-0">
                      <TextDisplay content={msg.text} isUserMessage={true} />
                    </div>
                    <p className="text-xs mt-2 opacity-70">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  // Teacher message (left side with avatar) - AI Teacher teaching
                  <div className="flex items-start gap-3 max-w-[85%]">
                    {/* Teacher Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                      <img 
                        src={teacherImage} 
                        alt="AI Teacher" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Message Bubble */}
                    <div className="flex-1 min-w-0 max-w-full">
                      <div className={`${getTeacherMessageStyle(msg)} text-gray-900 dark:text-gray-100 border rounded-2xl p-4 relative shadow-lg max-w-full overflow-hidden`}>
                        
                        {/* Section indicator for content messages */}
                        {msg.type === 'content' && msg.sectionIndex !== undefined && (
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200 dark:border-blue-700">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Teaching Section {msg.sectionIndex + 1}
                            </span>
                          </div>
                        )}
                        
                        {/* Message content with enhanced typewriter effect */}
                        <div style={{ fontSize: `${fontSize}px` }} className="w-full max-w-full min-w-0 leading-relaxed overflow-hidden">
                          {msg.type === 'content' ? (
                            <TypewriterEffect 
                              text={msg.text}
                              speed={20}
                              delay={200}
                              className="leading-relaxed w-full max-w-full"
                              showCursor={true}
                            />
                          ) : msg.type === 'bot' ? (
                            <TypewriterEffect 
                              text={msg.text}
                              speed={15}
                              delay={100}
                              className="leading-relaxed w-full max-w-full"
                              showCursor={true}
                            />
                          ) : (
                            <TextDisplay content={msg.text} isUserMessage={true} />
                          )}
                        </div>
                        
                        <p className="text-xs mt-3 opacity-70 text-gray-600 dark:text-gray-400">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Enhanced typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                  <img 
                    src={teacherImage} 
                    alt="AI Teacher" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4 relative shadow-lg">
                    <TypingIndicatorComponent />
                  </div>
                </div>
              </div>
            )}
            
            {showTypingIndicator && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                  <img 
                    src={teacherImage} 
                    alt="AI Teacher" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 relative shadow-lg">
                    <TypingIndicator isVisible={true} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            
            {/* Complete Chapter Button - prominent display on last section */}
            {currentChunkIndex === lessonData.content.length - 1 && !isCompleted && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                      Ready to Complete Chapter?
                    </h3>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                    You've reached the final section. Click below to mark this chapter as complete.
                  </p>
                  <button
                    onClick={handleCompleteChapter}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Complete Chapter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
