import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, BookOpen, CheckCircle, Play, Pause, RotateCcw, Send, Moon, Sun, Menu, X, ArrowLeft, Trophy, Star, Target, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react';
import { API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import { useDarkTheme } from './DarkThemeProvider';
import flowLogoLight from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import TextDisplay from './TextDisplay';

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
  const [showSidebar, setShowSidebar] = useState(false);
  const [completedChunks, setCompletedChunks] = useState(new Set([0]));
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [lessonError, setLessonError] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const autoPlayInterval = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    
    if (!token || !username) {
      navigate('/login');
      return;
    }
    
    // Check if user has the correct role for this page (Learn is student-only)
    if (role !== 'STUDENT') {
      if (role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/login');
      }
      return;
    }
  }, [navigate]);

  // Fetch lesson data from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchLessonData = async () => {
      try {
        console.log('🔍 [LEARN DEBUG] State received:', state);
        console.log('🔍 [LEARN DEBUG] State content check:', {
          hasState: !!state,
          hasContent: !!state?.content,
          contentLength: state?.content?.length,
          contentType: typeof state?.content,
          isArray: Array.isArray(state?.content)
        });
        
        // Use lesson data from state if available
        if (state?.content) {
          // Handle different content structures
          let contentArray = [];
          
          if (Array.isArray(state.content)) {
            // Direct array
            contentArray = state.content;
          } else if (state.content.lesson && Array.isArray(state.content.lesson)) {
            // Nested lesson array
            contentArray = state.content.lesson;
          } else if (state.content.content && Array.isArray(state.content.content)) {
            // Nested content array
            contentArray = state.content.content;
          }
          
          console.log('🔍 [LEARN DEBUG] Content extraction:', {
            originalContent: state.content,
            extractedContent: contentArray,
            contentLength: contentArray.length
          });
          
          if (contentArray.length > 0) {
            if (isMounted) {
              setLessonData(prev => ({
                ...prev,
                content: contentArray,
                class: state.className || prev.class,
                subject: state.subject || prev.subject,
                chapter: state.chapter || prev.chapter,
                chapterTitle: state.chapterTitle || prev.chapterTitle
              }));
              setIsLoadingLesson(false);
            }
            return;
          }
        }

        // Fetch from API if not available in state
        const className = state?.className || 'Class 9';
        const subject = state?.subject || 'Science';
        const chapter = state?.chapter || '1';
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        const params = new URLSearchParams({
          className: mapClassForExamAPI(className),
          subject: mapSubjectForExamAPI(subject),
          chapter
        });

        console.log('🔍 [LEARN DEBUG] Fetching lesson content with params:', {
          className: mapClassForExamAPI(className),
          subject: mapSubjectForExamAPI(subject),
          chapter,
          endpoint: `${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}`,
          fullUrl: `${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${params.toString()}`
        });
        
        // Clean token format (remove "Bearer " prefix if present)
        let cleanToken = token;
        if (token && token.startsWith('Bearer ')) {
          cleanToken = token.substring(7);
        }
        
        console.log('🔍 [LEARN DEBUG] Token check:', {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          cleanTokenLength: cleanToken ? cleanToken.length : 0,
          tokenStartsWithBearer: token ? token.startsWith('Bearer ') : false
        });
        
        const response = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 [LEARN DEBUG] API response status:', response.status);
        console.log('🔍 [LEARN DEBUG] API response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setLessonData(prev => ({
              ...prev,
              content: data.content || [],
              chapterTitle: data.chapterTitle || prev.chapterTitle
            }));
            setIsLoadingLesson(false);
          }
        } else {
          console.error('🔍 [LEARN DEBUG] Failed to fetch lesson content, status:', response.status);
          const errorText = await response.text();
          console.error('🔍 [LEARN DEBUG] Error response:', errorText);
          
          if (isMounted) {
            if (response.status === 404) {
              setLessonError('Learning content endpoint not found. Please check if the backend service is running.');
            } else if (response.status === 401) {
              setLessonError('Authentication failed. Please log in again.');
            } else {
              setLessonError(`Failed to load lesson content (Status: ${response.status})`);
            }
            setIsLoadingLesson(false);
          }
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        if (isMounted) {
          setLessonError('Unable to connect to server');
          setIsLoadingLesson(false);
        }
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
      // Only initialize if we have content and haven't already initialized
      setMessages([{ type: 'content', text: lessonData.content[0], timestamp: new Date(), sectionIndex: 0 }]);
    }
  }, [lessonData.content, messages.length]);

  // Function to add lesson content to messages without replacing conversation
  const addLessonContent = useCallback((contentIndex) => {
    const contentMessage = { 
      type: 'content', 
      text: lessonData.content[contentIndex], 
      timestamp: new Date(),
      sectionIndex: contentIndex 
    };
    setMessages(prev => [...prev, contentMessage]);
  }, [lessonData.content]);

  // Manual completion function
  const handleCompleteChapter = () => {
    if (currentChunkIndex === lessonData.content.length - 1) {
      setIsCompleted(true);
      setShowCompletionModal(true);
      setIsAutoPlay(false);
      setIsPlaying(false);
      // Stop the timer when chapter is completed
      setReadingTime(prev => prev); // Keep the current time
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && isPlaying && !isLoading && !showCompletionModal) {
      autoPlayInterval.current = setInterval(() => {
        if (currentChunkIndex + 1 < lessonData.content.length) {
          handleNext();
        } else {
          setIsAutoPlay(false);
          setIsPlaying(false);
        }
      }, 8000); // 8 seconds per chunk
    } else {
      clearInterval(autoPlayInterval.current);
    }

    return () => clearInterval(autoPlayInterval.current);
  }, [isAutoPlay, isPlaying, currentChunkIndex, isLoading, showCompletionModal, lessonData.content.length, handleNext]);

  // Reading time tracker
  useEffect(() => {
    let timer;
    if (isPlaying && !showCompletionModal) {
      timer = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, showCompletionModal]);

  // Start reading time when user first interacts
  useEffect(() => {
    if (currentChunkIndex > 0 && readingTime === 0 && !showCompletionModal) {
      setReadingTime(1);
    }
  }, [currentChunkIndex, readingTime, showCompletionModal]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [question]);

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
      // Add new section content to existing conversation
      addLessonContent(nextIndex);
    }
  }, [currentChunkIndex, lessonData.content.length, addLessonContent]);

  const handlePrevious = () => {
    if (currentChunkIndex > 0) {
      const prevIndex = currentChunkIndex - 1;
      setCurrentChunkIndex(prevIndex);
      // Don't mark as completed when going backwards
      // Add previous section content to existing conversation
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

      if (response.ok) {
        const data = await response.json();
        const botResponse = {
          type: 'bot',
          text: data.answer || data.response || 'No answer received',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setQuestion('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to get answer');
      }
    } catch (err) {
      console.error('Error asking question:', err);
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJumpToChunk = (index) => {
    // Allow jumping to any section (no restrictions)
    setCurrentChunkIndex(index);
    // Add selected section content to existing conversation
    addLessonContent(index);
    setShowSidebar(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = lessonData.content.length > 0 ? ((currentChunkIndex + 1) / lessonData.content.length) * 100 : 0;

  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-700 rounded-2xl max-w-20 shadow-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  const CompletionModal = () => (
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
              // Reset to initial state but keep conversation history
              setMessages([{ type: 'content', text: lessonData.content[0], timestamp: new Date(), sectionIndex: 0 }]);
              setReadingTime(0);
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      {/* Flow Navigation Header */}
      <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900">
        <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="h-10" />
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-[#343434] hover:text-white"
            onClick={() => navigate('/main')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Chapter Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Sidebar Toggle */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
              >
                {showSidebar ? 
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : 
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                }
              </button>
            </div>
            
            {/* Class, Subject, Chapter Info - Center */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lessonData.class}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lessonData.subject}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Chapter {lessonData.chapter}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Right side controls can go here if needed */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={`lg:w-80 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {isCompleted && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Chapter Complete!</span>
                  </div>
                )}
              </div>



              {/* Chapter Navigation */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Chapter Sections
                </h3>
                <div className="space-y-2">
                  {lessonData.content.map((_, index) => {
                    const isCurrentSection = currentChunkIndex === index;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleJumpToChunk(index)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          isCurrentSection
                            ? 'bg-indigo-100 dark:bg-indigo-900 border-l-4 border-indigo-500'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              isCurrentSection
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              Section {index + 1}
                            </span>
                          </div>
                          {isCurrentSection && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reading Time */}
              <div className="mt-6 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reading Time</span>
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    {formatTime(readingTime)}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timer</span>
                  <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                  }}
                  className={`w-full p-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isPlaying 
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span className="font-medium">
                    {isPlaying ? 'Stop' : 'Start'} Timer
                  </span>
                </button>
              </div>

              {/* Completion Status */}
              {isCompleted && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-300">Achievement Unlocked!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    You've completed all sections of this chapter. Great job!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
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
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-gray-400 dark:text-gray-300">
                    Loading lesson content...
                  </p>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {!isLoadingLesson && lessonData.content.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Learning Content
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePrevious}
                      disabled={currentChunkIndex === 0}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentChunkIndex + 1} of {lessonData.content.length}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentChunkIndex + 1 >= lessonData.content.length}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    {/* Clear Chat Button */}
                    {messages.length > 1 && (
                      <button
                        onClick={() => {
                          setMessages([{ type: 'content', text: lessonData.content[currentChunkIndex], timestamp: new Date(), sectionIndex: currentChunkIndex }]);
                        }}
                        className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Clear chat history"
                      >
                        <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                    
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
                  
                                      <button
                      onClick={() => {
                        setCurrentChunkIndex(0);
                        // Clear all messages and start fresh
                        setMessages([{ type: 'content', text: lessonData.content[0], timestamp: new Date(), sectionIndex: 0 }]);
                        setReadingTime(0);
                        setIsCompleted(false);
                        setCompletedChunks(new Set([0]));
                      }}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Restart chapter"
                    >
                      <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : msg.type === 'bot'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          : 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 border border-indigo-200 dark:border-indigo-700'
                      }`}
                    >
                      {/* Section indicator for content messages */}
                      {msg.type === 'content' && msg.sectionIndex !== undefined && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-200 dark:border-indigo-700">
                          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            Section {msg.sectionIndex + 1}
                          </span>
                        </div>
                      )}
                      <div style={{ fontSize: `${fontSize}px` }}>
                        <TextDisplay content={msg.text} />
                      </div>
                      <p className="text-xs mt-2 opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && <TypingIndicator />}
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

            {/* Question Input */}
            {!isLoadingLesson && lessonData.content.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              
              <div className="flex space-x-3">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about this chapter..."
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[50px] max-h-[120px] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !question.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && <CompletionModal />}
    </div>
  );
};

export default Learn;