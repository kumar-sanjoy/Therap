import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../../config';
import { useDarkTheme } from '../Common/DarkThemeProvider';
import { formatTime, calculateProgressPercentage, checkAuthAndRole } from './utils';

// Import components
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import QuestionInput from './QuestionInput';
import CompletionModal from './CompletionModal';

const Learn = () => {
  console.log('🔍 [LEARN DEBUG] Learn component is loading...');
  console.error('🔍 [LEARN DEBUG] ERROR TEST - Learn component is loading...');
  
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
  const [readingTime, setReadingTime] = useState(0);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Default font size
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
        console.log('🔍 [LEARN DEBUG] State received:', state);
        console.log('🔍 [LEARN DEBUG] State content check:', {
          hasState: !!state,
          hasContent: !!state?.content,
          contentLength: state?.content?.length,
          contentType: typeof state?.content,
          isArray: Array.isArray(state?.content)
        });
        
        // Use lesson data from state if available
        if (state?.content || state?.lesson) {
          // Handle different content structures
          let contentArray = [];
          
          if (Array.isArray(state.content)) {
            // Direct array
            contentArray = state.content;
          } else if (Array.isArray(state.lesson)) {
            // Direct lesson array
            contentArray = state.lesson;
          } else if (state.content?.lesson && Array.isArray(state.content.lesson)) {
            // Nested lesson array
            contentArray = state.content.lesson;
          } else if (state.content?.content && Array.isArray(state.content.content)) {
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
        
        console.log('🔍 [LEARN DEBUG] About to make fetch request to:', `${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${params.toString()}`);
        
        let response;
        try {
          response = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${cleanToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            mode: 'cors'
          });
          console.log('🔍 [LEARN DEBUG] Fetch request completed successfully');
        } catch (fetchError) {
          console.error('🔍 [LEARN DEBUG] Fetch request failed:', fetchError);
          console.error('🔍 [LEARN DEBUG] Fetch error details:', {
            name: fetchError.name,
            message: fetchError.message,
            stack: fetchError.stack
          });
          throw fetchError;
        }
        
        console.log('🔍 [LEARN DEBUG] API response status:', response.status);
        console.log('🔍 [LEARN DEBUG] API response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [LEARN DEBUG] API response data:', data);
          
          if (isMounted) {
            // Handle both 'content' and 'lesson' field names from backend
            const lessonContent = data.content || data.lesson || [];
            
            setLessonData(prev => ({
              ...prev,
              content: lessonContent,
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
    // Show typing indicator first
    setShowTypingIndicator(true);
    
    // Hide typing indicator and add content after a delay
    setTimeout(() => {
      setShowTypingIndicator(false);
      const contentMessage = { 
        type: 'content', 
        text: lessonData.content[contentIndex], 
        timestamp: new Date(),
        sectionIndex: contentIndex 
      };
      setMessages(prev => [...prev, contentMessage]);
    }, 1500); // 1.5 second delay to show typing
  }, [lessonData.content]);

  // Manual completion function
  const handleCompleteChapter = () => {
    if (currentChunkIndex === lessonData.content.length - 1) {
      setIsCompleted(true);
      setShowCompletionModal(true);
      // Keep the current reading time
      setReadingTime(prev => prev);
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
        
        console.log('🔍 [LEARN DEBUG] Raw API response:', data);
        
        // Use the utility function to parse the response
        const answerText = parseAIResponse(data);
        
        console.log('🔍 [LEARN DEBUG] Parsed answer text:', answerText);
        
        const botResponse = {
          type: 'bot',
          text: answerText,
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

  const progressPercentage = calculateProgressPercentage(currentChunkIndex, lessonData.content);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      {/* Header */}
      <Header 
        lessonData={lessonData}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={`lg:w-80 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <Sidebar 
              lessonData={lessonData}
              currentChunkIndex={currentChunkIndex}
              progressPercentage={progressPercentage}
              isCompleted={isCompleted}
              readingTime={readingTime}
              formatTime={formatTime}
              handleJumpToChunk={handleJumpToChunk}
            />
          </div>

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
          />
        </div>
      </div>

      {/* Question Input */}
      {!isLoadingLesson && lessonData.content.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <QuestionInput 
            question={question}
            setQuestion={setQuestion}
            isLoading={isLoading}
            handleAskQuestion={handleAskQuestion}
          />
        </div>
      )}

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