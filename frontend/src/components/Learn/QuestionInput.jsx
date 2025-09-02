import React, { useRef, useEffect, useState } from 'react';
import { Send, MessageCircle, Sparkles, Bot } from 'lucide-react';

const QuestionInput = ({ 
  question, 
  setQuestion, 
  isLoading, 
  handleAskQuestion 
}) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [question]);

  // Enhanced validation function to check for actual content
  const isValidQuestion = (text) => {
    if (!text) return false;
    const trimmedText = text.trim();
    return trimmedText.length > 0;
  };

  // Handle question submission with validation
  const handleSubmit = () => {
    if (isValidQuestion(question) && !isLoading) {
      handleAskQuestion();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border transition-all duration-300 ${
        isFocused 
          ? 'border-blue-400/50 dark:border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-[1.02]' 
          : 'border-gray-200/50 dark:border-gray-600/50 shadow-xl shadow-gray-500/10 hover:shadow-2xl hover:shadow-gray-500/15'
      } p-8`}>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Teacher Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask anything about this chapter
            </p>
          </div>
        </div>
        
        {/* Input section */}
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              isFocused
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm'
                : 'bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-gray-700/50 dark:to-gray-600/50'
            }`}></div>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What would you like to learn about this chapter?"
              className={`relative w-full p-4 border-0 rounded-2xl transition-all duration-300 resize-none min-h-[70px] max-h-[140px] ${
                isFocused
                  ? 'bg-white/90 dark:bg-gray-800/90 shadow-inner shadow-blue-500/10'
                  : 'bg-white/70 dark:bg-gray-800/70 hover:bg-white/80 dark:hover:bg-gray-800/80'
              } text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base leading-relaxed`}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {isFocused && (
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                Press Enter to send
              </div>
            )}
          </div>
          
          {/* Enhanced Ask Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isValidQuestion(question)}
            className={`relative px-8 py-4 rounded-2xl transition-all duration-300 font-semibold text-white min-w-[120px] flex items-center justify-center gap-3 overflow-hidden group ${
              !isLoading && isValidQuestion(question)
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1 active:translate-y-0' 
                : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
            } ${isLoading ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Button content */}
            <div className="relative flex items-center gap-3">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="hidden sm:inline font-medium">Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  <span className="hidden sm:inline font-medium">Ask AI</span>
                </>
              )}
            </div>
          </button>
        </div>
        
        {/* Enhanced Loading indicator */}
        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-500/20">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              AI is analyzing your question...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionInput;