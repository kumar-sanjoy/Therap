import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaBook } from 'react-icons/fa';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, DEV_MODE } from '../config';
import flowLogo from '../assets/flow-main.jpg';
import SelectionForm from './SelectionForm';

const GenerateNote = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const classConfig = {
    'Class 6': {
      subjects: ['Science', 'Math', 'English'], 
      chapters: { Science: 10, Math: 10, English: 10 },
    },
    'Class 7': {
      subjects: ['Science'],
      chapters: { Science: 14 },
    },
    'Class 8': {
      subjects: ['Science'],
      chapters: { Science: 14 },
    },
    'Class 9': {
      subjects: ['Physics', 'Chemistry', 'Biology', 'Economics', 'Geography', 'Business Entrepre.'],
      chapters: {
        Physics: 13,
        Chemistry: 12,
        Biology: 13,
        Economics: 9,
        Geography: 15,
        'Business Entrepre.': 12,
      },
    },
    'Class 10': {
      subjects: ['Physics', 'Chemistry', 'Biology', 'Economics', 'Geography', 'Business Entrepre.'],
      chapters: {
        Physics: 13,
        Chemistry: 12,
        Biology: 13,
        Economics: 9,
        Geography: 15,
        'Business Entrepre.': 12,
      },
    },
  };

  // Backend mappings
  const classToBackendMap = {
    'Class 6': 'd',
    'Class 7': 'c',
    'Class 8': 'b',
    'Class 9': 'a',
    'Class 10': 'a',
  };

  const subjectToBackendMap = {
    Physics: 'a',
    Chemistry: 'b',
    Biology: 'c',
    Economics: 'e',
    Geography: 'g',
    'Business Entrepre.': 'be',
    Science: 's',
    Math: 'm', // Placeholder for Class 6, update if needed
    English: 'en', // Placeholder for Class 6, update if needed
  };

  // Get available subjects for the selected class
  const availableSubjects = selectedClass ? classConfig[selectedClass]?.subjects || [] : [];

  // Get available chapters for the selected class and subject
  const availableChapters = selectedClass && selectedSubject ? classConfig[selectedClass]?.chapters[selectedSubject] || 0 : 0;

  const handleGenerateNote = async () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      setError('Please select all options');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (DEV_MODE) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Navigate with the selected class, subject, and chapter
        navigate('/shownotes', { 
          state: { 
            note: [], 
            skipInitialLoading: true,
            selectedClass,
            selectedSubject,
            selectedChapter
          } 
        });
      } else {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERATE_NOTE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            class: selectedClass,
            subject: selectedSubject,
            chapter: selectedChapter
          }),
        });

        if (response.ok) {
          const data = await response.json();
          navigate('/shownotes', { 
            state: { 
              note: data.note, 
              skipInitialLoading: true,
              selectedClass,
              selectedSubject,
              selectedChapter
            } 
          });
        } else {
          const data = await response.json();
          setError(data.message || 'Failed to generate note');
        }
      }
    } catch (error) {
      console.error('Error generating note:', error);
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="relative flex flex-col items-center justify-center">
            {/* Main loading icon with animation */}
            <div className="relative mb-6 animate-float">
              <FaBook className="text-5xl text-blue-500 drop-shadow-lg" />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full opacity-20 bg-blue-400 blur-md"></div>
            </div>
            {/* Animated dots with staggered animation */}
            <div className="flex justify-center space-x-2 mb-8">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2.5 h-2.5 rounded-full bg-blue-500"
                  style={{
                    animation: 'bounce 1.5s infinite ease-in-out',
                    animationDelay: `${delay}ms`
                  }}
                ></div>
              ))}
            </div>
            {/* Loading message with smooth fade */}
            <div className="text-center mb-8 animate-fadeIn">
              <p className="text-xl font-semibold mb-2 text-blue-600">
                Generating your notes...
              </p>
              <p className="text-gray-500">Just a moment while we prepare your content</p>
            </div>
            {/* Animated progress bar with gradient */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                style={{
                  animation: 'progress 2.5s ease-in-out infinite',
                  width: '0%'
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">Loading your notes...</p>
            {/* Floating particles with different animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-blue-300/40"
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
            Choose Class, Subject, and Chapter to Generate Notes
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
            buttonLabel="Generate Notes"
            onSubmit={handleGenerateNote}
            loading={isLoading}
            error={error}
            themeColor="blue"
          />
        </div>
      </div>
    </div>
  );
};

export default GenerateNote;