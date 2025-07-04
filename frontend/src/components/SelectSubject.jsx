import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaBook, FaQuestionCircle, FaPen, FaSpinner } from "react-icons/fa";
import { API_BASE_URL, API_ENDPOINTS, DEV_MODE, ROUTES } from '../config';
import flowLogo from '../assets/flow-main-nobg.png';
import { useSearchParams } from 'react-router-dom';
import SelectionForm from './SelectionForm';

const SelectSubject = ({ mode: propMode }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode');
  const mode = queryMode || location.state?.mode || propMode;
  
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const availableSubjects = selectedClass ? classConfig[selectedClass]?.subjects || [] : [];
  const availableChapters = selectedClass && selectedSubject ? classConfig[selectedClass]?.chapters[selectedSubject] || 0 : 0;

  const getLoadingMessage = () => {
    switch (mode) {
      case 'learn': return 'Preparing your learning journey...';
      case 'mcq': return 'Crafting challenging questions...';
      case 'written': return 'Setting up your practice session...';
      default: return 'Loading...';
    }
  };

  const getLoadingIcon = () => {
    switch (mode) {
      case 'learn': return <FaBook className="text-4xl text-blue-500" />;
      case 'mcq': return <FaQuestionCircle className="text-4xl text-purple-500" />;
      case 'written': return <FaPen className="text-4xl text-green-500" />;
      default: return <FaSpinner className="text-4xl text-gray-500" />;
    }
  };

  const getLoadingAnimation = () => {
    switch (mode) {
      case 'learn': return 'animate-bounce';
      case 'mcq': return 'animate-pulse';
      case 'written': return 'animate-ping';
      default: return 'animate-spin';
    }
  };

  const getLoadingColor = () => {
    switch (mode) {
      case 'learn': return 'from-blue-400 to-blue-600';
      case 'mcq': return 'from-purple-400 to-purple-600';
      case 'written': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTitleMessage = () => 'Select Your Learning Path';

  const themeColor = mode === 'learn' ? 'blue' : mode === 'mcq' ? 'purple' : 'green';

  const handleStart = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      setError('Please select all options');
      return;
    }

    setIsLoading(true);
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
          }
        };

        switch (mode) {
          case 'learn': navigate(ROUTES.LEARN, { state: { data: mockData.learn } }); break;
          case 'mcq':
          case 'test': navigate(ROUTES.QUIZ, { state: { data: mockData.mcq } }); break;
          case 'written': navigate(ROUTES.WRITTEN, { state: { data: mockData.written } }); break;
          default: setError('Invalid mode');
        }
      } else {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('User not logged in');
          return;
        }

        const requestData = { userId, class: selectedClass, subject: selectedSubject, chapter: selectedChapter };
        const endpoint = mode === 'learn' ? API_ENDPOINTS.LEARN : (mode === 'mcq' || mode === 'test') ? API_ENDPOINTS.QUIZ : API_ENDPOINTS.WRITTEN;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();

        switch (mode) {
          case 'learn': navigate(ROUTES.LEARN, { state: { data } }); break;
          case 'mcq':
          case 'test': navigate(ROUTES.QUIZ, { state: { data } }); break;
          case 'written': navigate(ROUTES.WRITTEN, { state: { data } }); break;
          default: setError('Invalid mode');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to start. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="relative flex flex-col items-center justify-center">
            {/* Main loading icon with smooth animation */}
            <div className={`relative mb-6 ${mode === 'learn' ? 'animate-float' : mode === 'mcq' ? 'animate-pulse' : 'animate-bounce'}`}>
              {getLoadingIcon()}
              
              {/* Subtle glow effect */}
              <div className={`absolute inset-0 rounded-full opacity-20 ${
                mode === 'learn' ? 'bg-blue-400' : 
                mode === 'mcq' ? 'bg-purple-400' : 
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
                'text-green-600'
              }`}>
                {getLoadingMessage()}
              </p>
              <p className="text-gray-500">Just a moment while we prepare your content</p>
            </div>
            
            {/* Animated progress bar with gradient */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full ${
                  mode === 'learn' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                  mode === 'mcq' ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 
                  'bg-gradient-to-r from-green-400 to-green-600'
                }`}
                style={{
                  animation: 'progress 2.5s ease-in-out infinite',
                  width: '0%'
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">Loading your {mode === 'learn' ? 'learning materials' : mode === 'mcq' ? 'quiz questions' : 'practice exercises'}</p>
            
            {/* Floating particles with different animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className={`absolute rounded-full ${
                    mode === 'learn' ? 'bg-blue-300/40' : 
                    mode === 'mcq' ? 'bg-purple-300/40' : 
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
          <style jsx>{`
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

      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-[2000px] mx-auto p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-6 md:mb-8">
            {getTitleMessage()}
          </h2>
          
          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg text-center mb-6 max-w-lg mx-auto">
              {error}
            </p>
          )}

          <SelectionForm
            classConfig={classConfig}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            buttonLabel={mode === 'learn' ? 'Start Learning' : mode === 'mcq' ? 'Start Quiz' : 'Start Practice'}
            onSubmit={handleStart}
            loading={isLoading}
            error={error}
            themeColor={themeColor}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectSubject;