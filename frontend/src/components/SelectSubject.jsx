import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaBook, FaQuestionCircle, FaPen, FaSpinner, FaGraduationCap, FaGlobe,FaFlask, FaChartLine, FaBriefcase, FaLeaf, FaHistory, FaStickyNote } from "react-icons/fa";
import { GiAtom } from "react-icons/gi";
import { API_BASE_URL, EXAM_API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, DEV_MODE, ROUTES, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import { useDarkTheme } from './DarkThemeProvider';
import flowLogoLight from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import { useSearchParams } from 'react-router-dom';
import SelectionForm from './SelectionForm';

const SelectSubject = ({ mode: propMode }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode');
  const mode = queryMode || location.state?.mode || propMode;
  
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [firstRequestId, setFirstRequestId] = useState(null);

  // Load recent selections from localStorage
  useEffect(() => {
    const savedClass = localStorage.getItem('class');
    const savedSubject = localStorage.getItem('subject');
    const savedChapter = localStorage.getItem('chapter');
    
    if (savedClass) setSelectedClass(savedClass);
    if (savedSubject) setSelectedSubject(savedSubject);
    if (savedChapter) setSelectedChapter(savedChapter);
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isLoading) {
        console.log('🔍 Component unmounting - cleaning up request state');
        setIsLoading(false);
        setCurrentRequestId(null);
        setFirstRequestId(null);
        window.firstRequestId = null; // Reset global first request ID
      }
    };
  }, [isLoading]);

  const classConfig = {
    'Class 7': { subjects: ['Science'], chapters: { Science: 14 } },
    'Class 8': { subjects: ['Science'], chapters: { Science: 14 } },
    'Class 9': {
      subjects: ['Physics', 'Chemistry', 'Biology', 'Economics', 'Geography', 'Business Entrepre.'],
      chapters: { Physics: 13, Chemistry: 12, Biology: 13, Economics: 9, Geography: 15, 'Business Entrepre.': 12 },
    },
    'Class 10': {
      subjects: ['Physics', 'Chemistry', 'Biology', 'Economics', 'Geography', 'Business Entrepre.'],
      chapters: { Physics: 13, Chemistry: 12, Biology: 13, Economics: 9, Geography: 15, 'Business Entrepre.': 12 },
    },
  };

  const subjectIcons = {
    'Physics': GiAtom,
    'Chemistry': FaFlask,
    'Biology': FaLeaf,
    'Economics': FaChartLine,
    'Geography': FaGlobe,
    'Business Entrepre.': FaBriefcase,
    'Science': FaFlask
  };

  const availableSubjects = selectedClass ? classConfig[selectedClass]?.subjects || [] : [];
  const availableChapters = selectedClass && selectedSubject ? classConfig[selectedClass]?.chapters[selectedSubject] || 0 : 0;

  const getLoadingMessage = () => {
    switch (mode) {
      case 'learn': return 'Preparing your learning journey...';
      case 'mcq': return 'Crafting challenging questions...';
      case 'written': return 'Setting up your practice session...';
      case 'revise': return 'Loading your previous mistakes...';
      case 'notes': return 'Generating your study notes...';
      default: return 'Loading...';
    }
  };

  const getLoadingIcon = () => {
    switch (mode) {
      case 'learn': return <FaBook className="text-4xl text-blue-500" />;
      case 'mcq': return <FaQuestionCircle className="text-4xl text-purple-500" />;
      case 'written': return <FaPen className="text-4xl text-green-500" />;
      case 'revise': return <FaHistory className="text-4xl text-orange-500" />;
      case 'notes': return <FaStickyNote className="text-4xl text-yellow-500" />;
      default: return <FaSpinner className="text-4xl text-gray-500" />;
    }
  };

  const getLoadingAnimation = () => {
    switch (mode) {
      case 'learn': return 'animate-bounce';
      case 'mcq': return 'animate-pulse';
      case 'written': return 'animate-ping';
      case 'revise': return 'animate-pulse';
      case 'notes': return 'animate-bounce';
      default: return 'animate-spin';
    }
  };

  const getLoadingColor = () => {
    switch (mode) {
      case 'learn': return 'from-blue-400 to-blue-600';
      case 'mcq': return 'from-purple-400 to-purple-600';
      case 'written': return 'from-green-400 to-green-600';
      case 'revise': return 'from-orange-400 to-orange-600';
      case 'notes': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTitleMessage = () => 'Select Your Learning Path';

  const getModeDescription = () => {
    switch (mode) {
      case 'learn': return 'Explore concepts through interactive learning modules';
      case 'mcq': return 'Test your knowledge with multiple choice questions';
      case 'written': return 'Practice with detailed written responses';
      case 'revise': return 'Review and practice your previous mistakes';
      case 'notes': return 'Generate comprehensive study notes';
      default: return 'Choose your preferred learning method';
    }
  };

  const themeColor = mode === 'learn' ? 'blue' : mode === 'mcq' ? 'purple' : mode === 'revise' ? 'orange' : mode === 'notes' ? 'yellow' : 'green';

  const handleStart = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      setError('Please select all options');
      return;
    }

    // Generate unique request ID
    const requestId = Date.now() + Math.random();
    
    // Prevent duplicate requests - only allow the first request
    if (isLoading) {
      console.log('🔍 Request blocked - already loading');
      return;
    }

    // Save selections to localStorage for later use
    localStorage.setItem('class', selectedClass);
    localStorage.setItem('subject', selectedSubject);
    localStorage.setItem('chapter', selectedChapter);

    setIsLoading(true);
    setCurrentRequestId(requestId);
    
    // Set first request ID if this is the first request
    if (!firstRequestId) {
      setFirstRequestId(requestId);
      console.log('🔍 First request started with ID:', requestId);
    } else {
      console.log('🔍 Subsequent request started with ID:', requestId, 'but first request was:', firstRequestId);
    }
    
    // Store first request ID in a ref to avoid state timing issues
    if (!window.firstRequestId) {
      window.firstRequestId = requestId;
      console.log('🔍 Global first request ID set:', requestId);
    }
    
    setError('');

    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = {
          learn: { content: "This is mock learning content...", title: "Mock Learning Title" },
          mcq: {
            questions: [
              { question: "What is the capital of France?", options: { a: "London", b: "Berlin", c: "Paris", d: "Madrid" }, answer: "c", hint: "Think about the Eiffel Tower", explanation: "Paris is the capital city of France" },
              { question: "Which planet is known as the Red Planet?", options: { a: "Venus", b: "Mars", c: "Jupiter", d: "Saturn" }, answer: "b", hint: "It's named after the Roman god of war", explanation: "Mars is called the Red Planet due to its reddish appearance" },
              { question: "What is 2 + 2?", options: { a: "3", b: "4", c: "5", d: "6" }, answer: "b", hint: "Basic arithmetic", explanation: "2 + 2 = 4" }
            ]
          },
          written: {
            questions: [
              { question: "Explain the process of photosynthesis", wordLimit: 200 },
              { question: "Describe the water cycle", wordLimit: 150 }
            ]
          },
          notes: {
            note: [
              "**Chapter 1: Motion**\n\n- Motion is the change in position of an object with respect to time.\n- Distance is the total path length covered by an object.\n- Displacement is the shortest distance between initial and final positions.\n- Speed is the rate of change of distance.\n- Velocity is the rate of change of displacement.",
              "**গতি সম্পর্কে:**\n\n- গতি হল সময়ের সাপেক্ষে বস্তুর অবস্থানের পরিবর্তন।\n- দূরত্ব হল বস্তু দ্বারা অতিক্রান্ত মোট পথের দৈর্ঘ্য।\n- সরণ হল প্রাথমিক এবং চূড়ান্ত অবস্থানের মধ্যে সবচেয়ে ছোট দূরত্ব।\n- বেগ হল দূরত্বের পরিবর্তনের হার।\n- বেগ হল সরণের পরিবর্তনের হার।",
              "**Key Formulas:**\n\n- Average Speed = Total Distance / Total Time\n- Average Velocity = Total Displacement / Total Time\n- Acceleration = Change in Velocity / Time"
            ]
          }
        };

        switch (mode) {
          case 'learn': navigate(ROUTES.LEARN, { state: { data: mockData.learn } }); break;
          case 'mcq':
          case 'test': navigate(ROUTES.QUIZ, { state: { data: mockData.mcq } }); break;
          case 'written': navigate(ROUTES.WRITTEN, { state: { data: mockData.written } }); break;
          case 'revise': navigate(ROUTES.PREV_MISTAKES, { state: { className: selectedClass, subject: selectedSubject, chapter: selectedChapter, count: 5 } }); break;
          case 'notes': navigate(ROUTES.SHOW_NOTES, { 
            state: { 
              className: selectedClass,
              subject: selectedSubject,
              chapter: selectedChapter,
              note: mockData.notes.note || [],
              skipInitialLoading: true
            } 
          }); break;
          default: setError('Invalid mode');
        }
      } else {
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (!username || !token) {
          setError('User not logged in');
          return;
        }

        let response;
        
        if (mode === 'learn') {
          // Learning endpoint uses GET with query parameters
          const params = new URLSearchParams({
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter
          });
          response = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } else if (mode === 'mcq' || mode === 'test') {
          // MCQ endpoint uses POST with query parameters
          const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
          const params = new URLSearchParams({
            username,
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter,
            count: '3'
          });
          response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.MCQ}?${params.toString()}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } else if (mode === 'written') {
          // Written question endpoint uses GET with query parameters
          const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
          const params = new URLSearchParams({
            username,
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter
          });
          response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.WRITTEN_QUESTION}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } else if (mode === 'notes') {
          // Notes endpoint uses GET with query parameters
          const params = new URLSearchParams({
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter
          });
          response = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.GENERATE_NOTE}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } else if (mode === 'revise') {
          // Revise mode needs to fetch previous mistakes
          const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
          const params = new URLSearchParams({
            username,
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter,
            count: '5'
          });
          response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.PREVIOUS_MCQ}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }

        // Only process response from the first request
        const globalFirstRequestId = window.firstRequestId;
        if (requestId !== globalFirstRequestId) {
          console.log('🔍 Request ignored - not the first request. Global first request ID:', globalFirstRequestId, 'Current request ID:', requestId);
          return;
        }

        if (!response.ok) {
          if (mode === 'revise' && response.status === 400) {
            throw new Error('Not enough questions practised for this subject. Please practice more questions first.');
          }
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        // Check again if this is still the first request
        const globalFirstRequestId2 = window.firstRequestId;
        if (requestId !== globalFirstRequestId2) {
          console.log('🔍 Request ignored after data fetch - not the first request');
          return;
        }

        switch (mode) {
          case 'learn': 
            navigate(ROUTES.LEARN, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter
              } 
            }); 
            break;
          case 'mcq':
          case 'test': 
            navigate(ROUTES.QUIZ, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                count: 3
              } 
            }); 
            break;
          case 'written': 
            navigate(ROUTES.WRITTEN, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                question: data.question || data.questions?.[0]?.question || ''
              } 
            }); 
            break;
          case 'notes': 
            navigate(ROUTES.SHOW_NOTES, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                note: data.note || data.notes || data.content || [],
                skipInitialLoading: true // Skip loading since data is already fetched
              } 
            }); 
            break;
          case 'revise': 
            navigate(ROUTES.PREV_MISTAKES, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                count: 5,
                questions: data.mcqs || data.questions || data.mistakes || []
              } 
            }); 
            break;
          default: setError('Invalid mode');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Provide more specific error messages based on error type
      if (error.name === 'TypeError' && error.message.includes('Load failed')) {
        if (mode === 'learn' || mode === 'notes') {
          setError('Unable to connect to learning server (port 8092). Please ensure the server is running.');
        } else {
          setError('Unable to connect to server. Please check your connection and try again.');
        }
      } else if (error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Failed to start. Please try again.');
      }
    } finally {
      // Only reset loading state if this is the first request
      const globalFirstRequestId = window.firstRequestId;
      if (requestId === globalFirstRequestId) {
        setIsLoading(false);
        setCurrentRequestId(null);
        setFirstRequestId(null); // Reset first request ID
        window.firstRequestId = null; // Reset global first request ID
        console.log('🔍 First request completed with ID:', requestId);
      } else {
        console.log('🔍 Request cleanup skipped - not the first request');
      }
    }
  };

  return (
    <div className={`h-screen flex flex-col ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
    }`}>
      {isLoading && (
        <div className={`fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${
          isDarkMode 
            ? 'bg-gray-900/95' 
            : 'bg-white/95'
        }`}>
          <div className="relative flex flex-col items-center justify-center">
            {/* Main loading icon with smooth animation */}
            <div className={`relative mb-6 ${mode === 'learn' ? 'animate-pulse' : mode === 'mcq' ? 'animate-pulse' : mode === 'revise' ? 'animate-pulse' : mode === 'notes' ? 'animate-bounce' : 'animate-bounce'}`}>
              {getLoadingIcon()}
              
              {/* Subtle glow effect */}
              <div className={`absolute inset-0 rounded-full opacity-20 ${
                mode === 'learn' ? 'bg-blue-400' : 
                mode === 'mcq' ? 'bg-purple-400' : 
                mode === 'revise' ? 'bg-orange-400' :
                mode === 'notes' ? 'bg-yellow-300' :
                'bg-green-400'
              } blur-md`}></div>
            </div>
            
            {/* Animated dots with staggered animation */}
            <div className="flex justify-center space-x-2 mb-8">
              {[0, 150, 300].map((delay) => (
                <div 
                  key={delay}
                  className={`w-2.5 h-2.5 rounded-full ${
                    mode === 'learn' ? 'bg-blue-500' : 
                    mode === 'mcq' ? 'bg-purple-500' : 
                    mode === 'revise' ? 'bg-orange-500' :
                    mode === 'notes' ? 'bg-yellow-400' :
                    'bg-green-500'
                  }`}
                  style={{
                    animation: 'bounce 1.5s infinite ease-in-out',
                    animationDelay: `${delay}ms`
                  }}
                ></div>
              ))}
            </div>
            
            {/* Loading message with smooth fade */}
            <div className="text-center mb-8 animate-fadeIn">
              <p className={`text-xl font-semibold mb-2 ${
                mode === 'learn' ? 'text-blue-600' : 
                mode === 'mcq' ? 'text-purple-600' : 
                mode === 'revise' ? 'text-orange-600' :
                mode === 'notes' ? 'text-yellow-500' :
                'text-green-600'
              }`}>
                {getLoadingMessage()}
              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Just a moment while we prepare your content</p>
            </div>
            
            {/* Animated progress bar with gradient */}
            <div className={`w-64 h-2 rounded-full overflow-hidden mb-2 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full rounded-full ${
                  mode === 'learn' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                  mode === 'mcq' ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 
                  mode === 'revise' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  mode === 'notes' ? 'bg-gradient-to-r from-yellow-300 to-yellow-500' :
                  'bg-gradient-to-r from-green-400 to-green-600'
                }`}
                style={{
                  animation: 'progress 2.5s ease-in-out infinite',
                  width: '0%'
                }}
              ></div>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Loading your {mode === 'learn' ? 'learning materials' : mode === 'mcq' ? 'quiz questions' : mode === 'notes' ? 'study notes' : 'practice exercises'}</p>
            
            {/* Floating particles with different animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className={`absolute rounded-full ${
                    mode === 'learn' ? 'bg-blue-300/40' : 
                    mode === 'mcq' ? 'bg-purple-300/40' : 
                    mode === 'revise' ? 'bg-orange-300/40' :
                    mode === 'notes' ? 'bg-yellow-200/40' :
                    'bg-green-300/40'
                  }`}
                  style={{
                    width: `${Math.random() * 6 + 2}px`,
                    height: `${Math.random() * 6 + 2}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 5 + 5}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.7
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Add these keyframes to your global CSS */}
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            @keyframes float {
              0% { transform: translateY(0) translateX(0); opacity: 0.7; }
              50% { transform: translateY(-20px) translateX(10px); opacity: 1; }
              100% { transform: translateY(0) translateX(20px); opacity: 0.7; }
            }
            @keyframes progress {
              0% { width: 0%; left: 0; }
              50% { width: 100%; left: 0; }
              100% { width: 0%; left: 100%; }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-out forwards;
            }
          `}</style>
        </div>
      )}

      <header className={`w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${
        isDarkMode 
          ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900/50' 
          : 'border-gray-100 bg-gradient-to-r from-white to-gray-50/50'
      }`}>
        <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="h-10" />
        <button 
          className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-[#343434] hover:text-white'
          }`}
          onClick={() => navigate('/main')}
        >
          <IoMdArrowRoundBack />
          Back
        </button>
      </header>

      {/* Mode Indicator Banner */}
      <div className={`bg-gradient-to-r ${
        mode === 'learn' ? 'from-blue-500 to-blue-600' : 
        mode === 'mcq' ? 'from-purple-500 to-purple-600' : 
        mode === 'revise' ? 'from-orange-500 to-orange-600' :
        mode === 'notes' ? 'from-yellow-400 to-yellow-500' :
        'from-green-500 to-green-600'
      } text-white py-3 px-6 shadow-md`}>
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {mode === 'learn' ? <FaBook className="text-lg" /> : 
               mode === 'mcq' ? <FaQuestionCircle className="text-lg" /> : 
               mode === 'revise' ? <FaHistory className="text-lg" /> :
               <FaPen className="text-lg" />}
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold capitalize">{mode} Mode</h1>
              <p className="text-blue-100 text-sm">{getModeDescription()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Notification under Mode Banner */}
      {error && (
        <div className={`border-b px-6 py-3 ${
          isDarkMode 
            ? 'bg-red-900/50 border-red-700' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className={`font-medium text-sm ${
                isDarkMode ? 'text-red-300' : 'text-red-700'
              }`}>{error}</p>
            </div>
            <button 
              onClick={() => setError('')}
              className={`transition-colors ${
                isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900/50 via-gray-800 to-gray-900/50' 
          : 'bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50'
      }`}>
        <div className="w-full max-w-4xl mx-auto p-8 md:p-12">

          <SelectionForm
            classConfig={classConfig}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            buttonLabel={mode === 'learn' ? 'Start Learning' : mode === 'mcq' ? 'Start Quiz' : mode === 'revise' ? 'Start Revision' : mode === 'notes' ? 'Show Notes' : 'Start Practice'}
            onSubmit={handleStart}
            loading={isLoading}
            error={error}
            themeColor={themeColor}
            subjectIcons={subjectIcons}
            isDarkMode={isDarkMode}
          />


        </div>
      </div>
    </div>
  );
};

export default SelectSubject;