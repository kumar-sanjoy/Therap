import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../../config';
import { useDarkTheme } from '../Common/DarkThemeProvider';
import { formatTime, calculateProgressPercentage, checkAuthAndRole, parseAIResponse } from './utils';
import { ArrowLeft, X } from 'lucide-react';
import flowLogoLight from '../../assets/flow-main-nobg.png';
import flowLogoDark from '../../assets/flow-dark.png';

// Import components
import MainContent from './MainContent';
import CompletionModal from './CompletionModal';

const Learn = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();

  // State for lesson data
  const [lessonData, setLessonData] = useState({
    class: state?.className || 'Class 9',
    subject: state?.subject || 'Science',
    chapter: state?.chapter || '1',
    chapterTitle: 'Chapter Content',
    content: []
  });

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { type: 'content', text: 'Loading lesson content...', timestamp: new Date(), sectionIndex: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedChunks, setCompletedChunks] = useState(new Set([0]));
  const [readingTime, setReadingTime] = useState(0);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [lessonError, setLessonError] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  const messagesEndRef = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuthAndRole(navigate);
  }, [navigate]);

  // Fetch lesson data from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchLessonData = async () => {
      try {
                            
        // Use lesson data from state if available
        if (state?.content || state?.lesson) {
          let contentArray = [];
          
          if (Array.isArray(state.content)) {
            contentArray = state.content;
                        } else if (Array.isArray(state.lesson)) {
            contentArray = state.lesson;
                        } else if (state.content?.lesson && Array.isArray(state.content.lesson)) {
            contentArray = state.content.lesson;
                        } else if (state.content?.content && Array.isArray(state.content.content)) {
            contentArray = state.content.content;
                        }
          
                      
          if (contentArray.length > 0) {
            setLessonData(prev => ({
              ...prev,
              content: contentArray,
              chapterTitle: state?.chapterTitle || `Chapter ${state?.chapter || '1'}`
            }));
            setIsLoadingLesson(false);
                        } else {
            throw new Error('No lesson content found');
          }
        } else {
                      
          // Try to fetch lesson content from API as fallback
          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
          
          if (!token || !username) {
            throw new Error('Authentication required');
          }
          
          const params = new URLSearchParams({
            className: mapClassForExamAPI(lessonData.class),
            subject: mapSubjectForExamAPI(lessonData.subject),
            chapter: lessonData.chapter
          });
          
                      
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEARN}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
                          
            const extractedContent = data.content || data.lessons || data;
            if (Array.isArray(extractedContent) && extractedContent.length > 0) {
              setLessonData(prev => ({
                ...prev,
                content: extractedContent,
                chapterTitle: data.chapterTitle || data.title || `Chapter ${lessonData.chapter}`
              }));
              setIsLoadingLesson(false);
                              return;
            }
          }
          
          throw new Error('No lesson data provided and API fetch failed');
        }
      } catch (err) {
        console.error('🔍 [LEARN DEBUG] Error loading lesson:', err);
        setLessonError(err.message || 'Failed to load lesson content');
        setIsLoadingLesson(false);
      }
    };

    fetchLessonData();
    return () => {
      isMounted = false;
    };
  }, [state]);

  // Initialize messages when lesson data is loaded
  useEffect(() => {
    if (lessonData.content.length > 0 && messages.length === 1) {
      setMessages([{ type: 'content', text: lessonData.content[0], timestamp: new Date(), sectionIndex: 0 }]);
    }
  }, [lessonData.content, messages.length]);

  // Function to add lesson content to messages without replacing conversation
  const addLessonContent = useCallback((contentIndex) => {
    setShowTypingIndicator(true);
    
    setTimeout(() => {
      setShowTypingIndicator(false);
      const contentMessage = { 
        type: 'content', 
        text: lessonData.content[contentIndex], 
        timestamp: new Date(),
        sectionIndex: contentIndex 
      };
      setMessages(prev => [...prev, contentMessage]);
    }, 1500);
  }, [lessonData.content]);

  // Manual completion function
  const handleCompleteChapter = () => {
    if (currentChunkIndex === lessonData.content.length - 1) {
      setIsCompleted(true);
      setShowCompletionModal(true);
    }
  };

  // Reading time tracker
  useEffect(() => {
    let timer;
    if (!showCompletionModal) {
      timer = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showCompletionModal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNext = useCallback(() => {
    if (currentChunkIndex + 1 < lessonData.content.length) {
      const nextIndex = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIndex);
      addLessonContent(nextIndex);
    }
  }, [currentChunkIndex, lessonData.content.length, addLessonContent]);

  const handlePrevious = () => {
    if (currentChunkIndex > 0) {
      const prevIndex = currentChunkIndex - 1;
      setCurrentChunkIndex(prevIndex);
      addLessonContent(prevIndex);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { type: 'user', text: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('question', question.trim());
      
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLEAR_DOUBT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get answer');
      }

      const data = await response.json();
      
      if (data.success) {
        const answerText = parseAIResponse(data);
        
        const botResponse = {
          type: 'bot',
          text: answerText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setQuestion('');
      } else {
        throw new Error(data.message || 'Failed to get answer');
      }
    } catch (err) {
      console.error('Error asking question:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJumpToChunk = (index) => {
    setCurrentChunkIndex(index);
    addLessonContent(index);
  };

  const progressPercentage = calculateProgressPercentage(currentChunkIndex, lessonData.content);

  // Show loading state
  if (isLoadingLesson) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading Lesson Content</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your learning experience...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (lessonError) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-300">Error Loading Content</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{lessonError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      {/* Header */}
      <header className={`w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${
        isDarkMode 
          ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900/50' 
          : 'border-gray-100 bg-gradient-to-r from-white to-gray-50/50'
      }`}>
        <div className="flex items-center space-x-6">
          <img 
            src={isDarkMode ? flowLogoDark : flowLogoLight} 
            alt="FLOW Logo" 
            className="h-10 rounded-xl" 
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/main')}
            className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-[#343434] hover:text-white'
            }`}
            aria-label="Go back to main page"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <MainContent
        lessonData={lessonData}
        currentChunkIndex={currentChunkIndex}
        messages={messages}
        isLoading={isLoading}
        isLoadingLesson={isLoadingLesson}
        lessonError={lessonError}
        error={error}
        showTypingIndicator={showTypingIndicator}
        fontSize={fontSize}
        setFontSize={setFontSize}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleCompleteChapter={handleCompleteChapter}
        isCompleted={isCompleted}
        messagesEndRef={messagesEndRef}
        question={question}
        setQuestion={setQuestion}
        handleAskQuestion={handleAskQuestion}
        progressPercentage={progressPercentage}
        readingTime={readingTime}
        handleJumpToChunk={handleJumpToChunk}
      />

      {/* Completion Modal */}
      <CompletionModal 
        showCompletionModal={showCompletionModal}
        setShowCompletionModal={setShowCompletionModal}
        readingTime={readingTime}
        lessonData={lessonData}
        formatTime={formatTime}
        setCurrentChunkIndex={setCurrentChunkIndex}
        setMessages={setMessages}
        setIsCompleted={setIsCompleted}
        setCompletedChunks={setCompletedChunks}
      />
    </div>
  );
};

export default Learn;