import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaQuestionCircle } from "react-icons/fa";
import { GrFormNextLink } from "react-icons/gr";
import { IoMdArrowRoundBack } from "react-icons/io";
import TextDisplay from "./TextDisplay";
import flowLogo from '../assets/flow-main-nobg.png';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

const Learn = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [chunks, setChunks] = useState(state?.content || []);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState(
    state?.content && state.content.length > 0
      ? [{ type: 'content', text: state.content[0] }]
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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
    if (!question.trim()) return;

    setMessages([...messages, { type: 'user', text: question }]);
    setIsLoading(true);
    setError('');

    // Concatenate current chunk with the question
    const combinedQuestion = chunks[currentChunkIndex]
      ? `${chunks[currentChunkIndex]}\n\nQuestion: ${question}`
      : question;

    const formData = new FormData();
    formData.append('question', combinedQuestion);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLEAR_DOUBT}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: data.response },
        ]);
        setQuestion('');
      } else {
        setError(data.error || 'Failed to fetch answer');
      }
    } catch (err) {
      console.error('Error fetching answer:', err);
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
    }
    setIsLoading(false);
  };

  // Messenger-style typing indicator component
  const TypingIndicator = () => (
    <div className="bg-white border border-gray-200 text-gray-800 w-fit max-w-[90%] mr-auto shadow-sm rounded-lg p-4 mb-4">
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
    <div className="min-h-screen bg-gray-100">
      {/* Loading Overlay - only for proceed action */}
      {isLoading && !question && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="text-gray-700 text-lg mt-4">Loading...</p>
        </div>
      )}

      {/* Header */}
      <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b border-gray-100 shrink-0 bg-gradient-to-r from-white to-gray-50/50">
        <img src={flowLogo} alt="FLOW Logo" className="h-10" />
        <button 
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-[#343434] hover:text-white transition-all flex items-center gap-2"
          onClick={() => navigate('/main')}
        >
          <IoMdArrowRoundBack />
          Back
        </button>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#343434]">
            {`${state?.class} ${state?.subject} Chapter ${state?.chapter}`}
          </h1>
          <div className="bg-white p-4 rounded-lg shadow-sm w-full md:w-80 lg:w-96">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Progress</span>
              <span className="text-sm font-bold text-[#343434]">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className="bg-[#343434] h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 h-[260px] overflow-y-auto border border-gray-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 p-4 rounded-lg w-fit max-w-[80%] md:max-w-[70%] lg:max-w-[60%] ${
                  msg.type === 'user' 
                    ? 'bg-[#343434] text-white ml-auto break-words' 
                    : msg.type === 'bot' 
                    ? 'bg-white border border-gray-200 text-gray-800 mr-auto shadow-sm break-words' 
                    : 'bg-blue-50 border border-blue-200 text-gray-800 break-words'
                }`}
              >
                <TextDisplay content={msg.text} />
              </div>
            ))}
            {isLoading && question && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-xl font-bold text-[#343434] mb-4 flex items-center gap-2">
            <FaQuestionCircle className="text-[#343434]" />
            Ask Questions
          </h2>
          <div className="flex flex-col gap-4">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#343434] focus:border-transparent transition-all resize-none min-h-[60px] max-h-[200px]"
              disabled={isLoading}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
            />
            <div className="flex gap-3 justify-end">
            <button
                onClick={handleAskQuestion}
                className="px-6 py-3 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Ask
              </button>
              <button
                onClick={handleProceed}
                className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#343434] font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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