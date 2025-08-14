import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaQuestionCircle } from "react-icons/fa";
import { GrFormNextLink } from "react-icons/gr";
import { IoMdArrowRoundBack } from "react-icons/io";
import TextDisplay from "./TextDisplay";
import flowLogo from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import { LEARNING_API_BASE_URL, API_BASE_URL, API_ENDPOINTS, DEV_MODE, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import { useDarkTheme } from './DarkThemeProvider';
import ThemeToggle from './ThemeToggle';

const Learn = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();

  // Debug dark theme
  console.log('🔍 [LEARN DEBUG] isDarkMode:', isDarkMode);

  console.log('🔍 [LEARN DEBUG] Learn component initialized');
  console.log('🔍 [LEARN DEBUG] Initial state:', state);

  // Inject dummy data if state is missing or incomplete
  const dummyState = {
    class: state?.class || state?.className || 'Class 9',
    subject: state?.subject || 'Science',
    chapter: state?.chapter || '1',
    content: [
      'Welcome to the learning module! This is a dummy learning chunk for testing.',
      'This is the second chunk of dummy content. Proceed to see more.',
      'You have reached the end of the dummy content. Ask any question!'
    ]
  };
  const effectiveState = state && state.class && state.subject && state.chapter && state.content && state.content.length > 0 ? state : dummyState;
  
  console.log('🔍 [LEARN DEBUG] Effective state:', effectiveState);

  const [chunks, setChunks] = useState(effectiveState.content);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState(
    effectiveState.content && effectiveState.content.length > 0
      ? [{ type: 'content', text: effectiveState.content[0] }]
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  console.log('🔍 [LEARN DEBUG] Initial chunks:', chunks);
  console.log('🔍 [LEARN DEBUG] Initial messages:', messages);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch learning content on mount
  useEffect(() => {
    let isMounted = true; // Prevent setting state if component unmounts
    
    const fetchLearningContent = async () => {
      console.log('🔍 [LEARN DEBUG] fetchLearningContent called');
      console.log('🔍 [LEARN DEBUG] DEV_MODE:', DEV_MODE);
      console.log('🔍 [LEARN DEBUG] State received:', state);
      
      if (DEV_MODE) {
        console.log('🔍 [LEARN DEBUG] Skipping API call due to DEV_MODE');
        return; // Skip API call in dev mode
      }

      try {
        const className = state?.className || state?.class || 'Class 9';
        const subject = state?.subject || 'Science';
        const chapter = state?.chapter || '1';
        
        console.log('🔍 [LEARN DEBUG] Raw parameters:', { className, subject, chapter });
        
        const mappedClassName = mapClassForExamAPI(className);
        const mappedSubject = mapSubjectForExamAPI(subject);
        
        console.log('🔍 [LEARN DEBUG] Mapped parameters:', { 
          className: mappedClassName, 
          subject: mappedSubject, 
          chapter 
        });
        
        const params = new URLSearchParams({
          className: mappedClassName,
          subject: mappedSubject,
          chapter
        });

        const apiUrl = `${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${params.toString()}`;
        console.log('🔍 [LEARN DEBUG] API URL:', apiUrl);
        console.log('🔍 [LEARN DEBUG] LEARNING_API_BASE_URL:', LEARNING_API_BASE_URL);
        console.log('🔍 [LEARN DEBUG] API_ENDPOINTS.LEARN:', API_ENDPOINTS.LEARN);

        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 [LEARN DEBUG] Response status:', response.status);
        console.log('🔍 [LEARN DEBUG] Response ok:', response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [LEARN DEBUG] Response data:', data);
          
          if (!isMounted) return; // Don't set state if component unmounted
          
          // Check for lesson array in the response
          if (data.lesson && Array.isArray(data.lesson)) {
            console.log('🔍 [LEARN DEBUG] Lesson array found, length:', data.lesson.length);
            console.log('🔍 [LEARN DEBUG] First lesson item:', data.lesson[0]);
            setChunks(data.lesson);
            setMessages([{ type: 'content', text: data.lesson[0] }]);
            console.log('🔍 [LEARN DEBUG] Chunks and messages updated with lesson data');
          } else if (data.content && Array.isArray(data.content)) {
            // Fallback to content array if lesson doesn't exist
            console.log('🔍 [LEARN DEBUG] Content array found, length:', data.content.length);
            setChunks(data.content);
            setMessages([{ type: 'content', text: data.content[0] }]);
          } else {
            console.log('🔍 [LEARN DEBUG] No lesson or content array found in response');
            console.log('🔍 [LEARN DEBUG] Available keys in data:', Object.keys(data));
            console.log('🔍 [LEARN DEBUG] Full response data:', data);
          }
        } else {
          console.error('🔍 [LEARN DEBUG] Failed to fetch learning content, status:', response.status);
          const errorText = await response.text();
          console.error('🔍 [LEARN DEBUG] Error response body:', errorText);
        }
      } catch (error) {
        console.error('🔍 [LEARN DEBUG] Error fetching learning content:', error);
        console.error('🔍 [LEARN DEBUG] Error name:', error.name);
        console.error('🔍 [LEARN DEBUG] Error message:', error.message);
        console.error('🔍 [LEARN DEBUG] Error stack:', error.stack);
      }
    };

    fetchLearningContent();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [state?.className, state?.subject, state?.chapter]); // More specific dependencies

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200 // max height in pixels
      )}px`;
    }
  }, [question]);

  const handleAskQuestion = async () => {
    console.log('🔍 [LEARN DEBUG] handleAskQuestion called');
    console.log('🔍 [LEARN DEBUG] Question:', question);
    console.log('🔍 [LEARN DEBUG] Current chunk index:', currentChunkIndex);
    console.log('🔍 [LEARN DEBUG] Total chunks:', chunks.length);
    
    if (!question.trim()) {
      console.log('🔍 [LEARN DEBUG] Question is empty, returning');
      return;
    }

    setMessages([...messages, { type: 'user', text: question }]);
    setIsLoading(true);
    setError('');

    // Concatenate current chunk with the question
    const combinedQuestion = chunks[currentChunkIndex]
      ? `${chunks[currentChunkIndex]}\n\nQuestion: ${question}`
      : question;
    
    console.log('🔍 [LEARN DEBUG] Combined question:', combinedQuestion);

    if (DEV_MODE) {
      console.log('🔍 [LEARN DEBUG] Using DEV_MODE dummy response');
      // Simulate a dummy bot response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: `This is a dummy answer to: "${question}" (DEV_MODE)` },
        ]);
        setQuestion('');
        setIsLoading(false);
      }, 700);
      return;
    }

    const formData = new FormData();
    formData.append('question', combinedQuestion);
    
    console.log('🔍 [LEARN DEBUG] FormData created with question');

    try {
      const apiUrl = `${LEARNING_API_BASE_URL}${API_ENDPOINTS.CLEAR_DOUBT}`;
      console.log('🔍 [LEARN DEBUG] Clear doubt API URL:', apiUrl);
      
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('🔍 [LEARN DEBUG] Clear doubt response status:', response.status);
      console.log('🔍 [LEARN DEBUG] Clear doubt response ok:', response.ok);

      const data = await response.json();
      console.log('🔍 [LEARN DEBUG] Clear doubt response data:', data);

      if (response.ok) {
        console.log('🔍 [LEARN DEBUG] Setting bot response:', data.response);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: data.response },
        ]);
        setQuestion('');
      } else {
        console.error('🔍 [LEARN DEBUG] Clear doubt failed:', data.error);
        setError(data.error || 'Failed to fetch answer');
      }
    } catch (err) {
      console.error('🔍 [LEARN DEBUG] Error fetching answer:', err);
      console.error('🔍 [LEARN DEBUG] Error name:', err.name);
      console.error('🔍 [LEARN DEBUG] Error message:', err.message);
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    setIsLoading(true);
    setError('');

    if (currentChunkIndex + 1 < chunks.length) {
      const nextIndex = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIndex);
      setMessages([...messages, { type: 'content', text: chunks[nextIndex] }]);
      
      // Scroll to the new content instead of bottom
      setTimeout(() => {
        const newMessageElement = document.querySelector(`[data-message-index="${messages.length}"]`);
        if (newMessageElement) {
          newMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    setIsLoading(false);
  };

  // Messenger-style typing indicator component
  const TypingIndicator = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 w-fit max-w-[90%] mr-auto shadow-sm rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  // Progress percentage calculation
  const progressPercentage = chunks.length > 0 ? ((currentChunkIndex + 1) / chunks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Loading Overlay - only for proceed action */}
      {isLoading && !question && (
        <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="text-lg mt-4 text-gray-700 dark:text-white">Loading...</p>
        </div>
      )}

      {/* Header */}
      <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900">
        <img src={isDarkMode ? flowLogoDark : flowLogo} alt="FLOW Logo" className="h-10" />
        <div className="flex items-center gap-4">
          <ThemeToggle size="sm" />
          <button 
            className="px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-[#343434] hover:text-white"
            onClick={() => navigate('/main')}
          >
            <IoMdArrowRoundBack />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#343434] dark:text-white">
            {`${effectiveState?.class} ${effectiveState?.subject} Chapter ${effectiveState?.chapter}`}
          </h1>
          <div className="p-4 rounded-lg shadow-sm w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
              <span className="text-sm font-bold text-[#343434] dark:text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-3">
              <div 
                className="bg-[#343434] dark:bg-gray-300 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border rounded-lg bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-700">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Chat Container */}
        <div className="rounded-xl shadow-sm p-4 md:p-6 mb-4 bg-white dark:bg-gray-800">
          <div className="rounded-lg p-4 h-[400px] overflow-y-auto border bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600">
            {messages.map((msg, index) => (
              <div
                key={index}
                data-message-index={index}
                className={`mb-4 p-4 rounded-lg w-fit max-w-[85%] md:max-w-[75%] lg:max-w-[65%] ${
                  msg.type === 'user' 
                    ? 'bg-[#343434] text-white ml-auto break-words' 
                    : msg.type === 'bot' 
                    ? 'bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 text-gray-800 dark:text-gray-200 mr-auto shadow-sm break-words' 
                    : 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-gray-200 break-words'
                }`}
              >
                <TextDisplay content={msg.text} isUserMessage={msg.type === 'user'} />
              </div>
            ))}
            {isLoading && question && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl shadow-sm p-3 md:p-4 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#343434] dark:text-white">
            <FaQuestionCircle className="text-[#343434] dark:text-white" />
            Ask Questions
          </h2>
          <div className="flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#343434] focus:border-transparent transition-all resize-none min-h-[50px] max-h-[120px] text-sm border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isLoading}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleAskQuestion}
                className="px-4 py-2 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={isLoading}
              >
                Ask
              </button>
              <button
                onClick={handleProceed}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-[#343434] dark:text-gray-200 font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                disabled={isLoading || currentChunkIndex + 1 >= chunks.length}
              >
                Next
                <GrFormNextLink />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;