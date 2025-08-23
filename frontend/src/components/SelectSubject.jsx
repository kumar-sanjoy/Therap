import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaBook, FaQuestionCircle, FaPen, FaSpinner, FaGraduationCap, FaGlobe,FaFlask, FaChartLine, FaBriefcase, FaLeaf, FaHistory, FaStickyNote } from "react-icons/fa";
import { GiAtom } from "react-icons/gi";
import { API_BASE_URL, EXAM_API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, ROUTES, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
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
  
  console.log('🔍 [SELECT_SUBJECT DEBUG] Component initialized with mode:', {
    propMode,
    queryMode,
    locationStateMode: location.state?.mode,
    finalMode: mode
  });
  
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [firstRequestId, setFirstRequestId] = useState(null);

  // Helper function to clean and format token
  const getFormattedToken = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;
    
    // Remove any whitespace and "Bearer " prefix if present
    let cleanToken = token.trim();
    if (cleanToken.startsWith('Bearer ')) {
      cleanToken = cleanToken.substring(7);
    }
    
    return cleanToken;
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    
    if (!token || !username) {
      navigate('/login');
      return;
    }
    
    // Check if user has a valid role
    if (!role || (role !== 'STUDENT' && role !== 'TEACHER')) {
      navigate('/login');
      return;
    }
  }, [navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 [SELECT_SUBJECT DEBUG] handleSubmit called with mode:', mode);
    console.log('🔍 [SELECT_SUBJECT DEBUG] Selected values:', {
      class: selectedClass,
      subject: selectedSubject,
      chapter: selectedChapter
    });
    
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      setError('Please select all fields');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) {
      console.log('🔍 [SELECT_SUBJECT DEBUG] Request blocked - already loading');
      return;
    }

    const requestId = Date.now();
    setCurrentRequestId(requestId);
    
    // Track first request to prevent race conditions
    if (!firstRequestId) {
      setFirstRequestId(requestId);
      window.firstRequestId = requestId;
    }

    setIsLoading(true);
    setError('');

    try {
      // For quiz mode, fetch questions first
      if (mode === 'test' || mode === 'mcq') {
        console.log('🔍 [SELECT_SUBJECT DEBUG] Processing quiz mode');
        const token = getFormattedToken();
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        
        console.log('🔍 [SELECT_SUBJECT DEBUG] Authentication check:', {
          rawToken: localStorage.getItem(STORAGE_KEYS.TOKEN) ? `${localStorage.getItem(STORAGE_KEYS.TOKEN).substring(0, 20)}...` : 'null',
          cleanToken: token ? `${token.substring(0, 20)}...` : 'null',
          tokenLength: token ? token.length : 0,
          username: username,
          hasToken: !!token,
          hasUsername: !!username,
          rawTokenStartsWithBearer: localStorage.getItem(STORAGE_KEYS.TOKEN) ? localStorage.getItem(STORAGE_KEYS.TOKEN).startsWith('Bearer ') : false
        });
        
        if (!token || !username) {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Missing authentication:', { token: !!token, username: !!username });
          navigate('/login');
          return;
        }

        // Additional validation for token
        if (token.length < 10) {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Token seems too short:', { tokenLength: token.length });
          navigate('/login');
          return;
        }

        const params = new URLSearchParams({
          username,
          className: mapClassForExamAPI(selectedClass),
          subject: mapSubjectForExamAPI(selectedSubject),
          chapter: selectedChapter,
          count: '5' // Default count of 5 questions
        });

        console.log('🔍 [SELECT_SUBJECT DEBUG] Fetching questions for quiz with parameters:', {
          username,
          className: mapClassForExamAPI(selectedClass),
          subject: mapSubjectForExamAPI(selectedSubject),
          chapter: selectedChapter,
          rawClassName: selectedClass,
          rawSubject: selectedSubject
        });
        console.log('🔍 [SELECT_SUBJECT DEBUG] Questions endpoint:', `${EXAM_API_BASE_URL}${API_ENDPOINTS.MCQ_QUESTIONS}`);
        console.log('🔍 [SELECT_SUBJECT DEBUG] Query parameters:', params.toString());
        console.log('🔍 [SELECT_SUBJECT DEBUG] Authorization header:', `Bearer ${token.substring(0, 20)}...`);

        const headers = {
          'Authorization': `Bearer ${token}`
        };

        console.log('🔍 [SELECT_SUBJECT DEBUG] Request headers:', headers);

        const response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.MCQ_QUESTIONS}?${params.toString()}`, {
          method: 'POST',
          headers
        });

        console.log('🔍 [SELECT_SUBJECT DEBUG] Questions response status:', response.status);
        console.log('🔍 [SELECT_SUBJECT DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [SELECT_SUBJECT DEBUG] Questions response data:', data);
          
          // Navigate to quiz with fetched questions
          navigate(ROUTES.QUIZ, { 
            state: { 
              className: selectedClass,
              subject: selectedSubject,
              chapter: selectedChapter,
              questions: data.mcqs || data.questions || data,
              difficultyLevel: data.difficultyLevel
            } 
          });
        } else {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch questions, status:', response.status);
          const errorText = await response.text();
          console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
          setError('Failed to fetch quiz questions. Please try again.');
        }
        return;
      }

      // For revise mode, fetch previous mistakes first
      if (mode === 'revise') {
        console.log('🔍 [SELECT_SUBJECT DEBUG] Processing revise mode');
        const token = getFormattedToken();
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        
        console.log('🔍 [SELECT_SUBJECT DEBUG] Authentication check for revise:', {
          rawToken: localStorage.getItem(STORAGE_KEYS.TOKEN) ? `${localStorage.getItem(STORAGE_KEYS.TOKEN).substring(0, 20)}...` : 'null',
          cleanToken: token ? `${token.substring(0, 20)}...` : 'null',
          tokenLength: token ? token.length : 0,
          username: username,
          hasToken: !!token,
          hasUsername: !!username
        });
        
        if (!token || !username) {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Missing authentication for revise:', { token: !!token, username: !!username });
          navigate('/login');
          return;
        }

        // Additional validation for token
        if (token.length < 10) {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Token seems too short for revise:', { tokenLength: token.length });
          navigate('/login');
          return;
        }

        const params = new URLSearchParams({
          username,
          className: mapClassForExamAPI(selectedClass),
          subject: mapSubjectForExamAPI(selectedSubject),
          chapter: selectedChapter,
          count: '5' // Default count of 5 questions
        });

        console.log('🔍 [SELECT_SUBJECT DEBUG] Fetching previous mistakes with parameters:', {
          username,
          className: mapClassForExamAPI(selectedClass),
          subject: mapSubjectForExamAPI(selectedSubject),
          chapter: selectedChapter,
          rawClassName: selectedClass,
          rawSubject: selectedSubject
        });
        console.log('🔍 [SELECT_SUBJECT DEBUG] Previous mistakes endpoint:', `${EXAM_API_BASE_URL}${API_ENDPOINTS.PREVIOUS_MCQ}`);
        console.log('🔍 [SELECT_SUBJECT DEBUG] Query parameters:', params.toString());

        const response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.PREVIOUS_MCQ}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔍 [SELECT_SUBJECT DEBUG] Previous mistakes response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [SELECT_SUBJECT DEBUG] Previous mistakes response data:', data);
          
          // Navigate to PrevMistake with fetched questions
          navigate(ROUTES.PREV_MISTAKES, { 
            state: { 
              className: selectedClass,
              subject: selectedSubject,
              chapter: selectedChapter,
              questions: data.mcqs || data.questions || data,
              count: 5
            } 
          });
        } else {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch previous mistakes, status:', response.status);
          const errorText = await response.text();
          console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
          
          // Check if it's the "not enough questions practiced" error
          if (errorText.includes('Not enough questions practiced')) {
            setError('No previous mistakes found for this subject. Please practice some questions first and then try again.');
          } else {
            setError('Failed to fetch previous mistakes. Please try again.');
          }
        }
        return;
      }

      console.log('🔍 [SELECT_SUBJECT DEBUG] Processing non-quiz mode:', mode);
      // Navigate based on mode (for non-quiz modes)
      switch (mode) {
        case 'learn':
          console.log('🔍 [SELECT_SUBJECT DEBUG] Processing learn mode');
          const learnToken = getFormattedToken();
          const learnUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
          
          if (!learnToken || !learnUsername) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Missing authentication for learn:', { token: !!learnToken, username: !!learnUsername });
            navigate('/login');
            return;
          }

          // Additional validation for token
          if (learnToken.length < 10) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Token seems too short for learn:', { tokenLength: learnToken.length });
            navigate('/login');
            return;
          }

          const learnParams = new URLSearchParams({
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter
          });

          console.log('🔍 [SELECT_SUBJECT DEBUG] Fetching learning content with parameters:', {
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter,
            rawClassName: selectedClass,
            rawSubject: selectedSubject
          });
          console.log('🔍 [SELECT_SUBJECT DEBUG] Learn endpoint:', `${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}`);
          console.log('🔍 [SELECT_SUBJECT DEBUG] Query parameters:', learnParams.toString());

          const learnResponse = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${learnParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${learnToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('🔍 [SELECT_SUBJECT DEBUG] Learn response status:', learnResponse.status);

          if (learnResponse.ok) {
            const learnData = await learnResponse.json();
            console.log('🔍 [SELECT_SUBJECT DEBUG] Learn response data:', learnData);
            console.log('🔍 [SELECT_SUBJECT DEBUG] Learn response structure:', {
              hasContent: !!learnData.content,
              hasLessons: !!learnData.lessons,
              hasChapterTitle: !!learnData.chapterTitle,
              hasTitle: !!learnData.title,
              contentType: typeof learnData.content,
              lessonsType: typeof learnData.lessons,
              isContentArray: Array.isArray(learnData.content),
              isLessonsArray: Array.isArray(learnData.lessons)
            });
            
            // Extract content from response
            const extractedContent = learnData.content || learnData.lessons || learnData;
            const extractedTitle = learnData.chapterTitle || learnData.title || `${selectedSubject} - Chapter ${selectedChapter}`;
            
            console.log('🔍 [SELECT_SUBJECT DEBUG] Extracted content:', {
              content: extractedContent,
              title: extractedTitle,
              contentLength: Array.isArray(extractedContent) ? extractedContent.length : 'Not an array'
            });
            
            // Navigate to Learn with fetched content
            navigate(ROUTES.LEARN, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                content: extractedContent,
                chapterTitle: extractedTitle
              } 
            });
          } else {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch learning content, status:', learnResponse.status);
            const errorText = await learnResponse.text();
            console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
            setError('Failed to fetch learning content. Please try again.');
          }
          return;
        case 'written':
          console.log('🔍 [SELECT_SUBJECT DEBUG] Processing written question mode');
          const writtenToken = getFormattedToken();
          const writtenUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
          
          if (!writtenToken || !writtenUsername) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Missing authentication for written question:', { token: !!writtenToken, username: !!writtenUsername });
            navigate('/login');
            return;
          }

          // Additional validation for token
          if (writtenToken.length < 10) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Token seems too short for written question:', { tokenLength: writtenToken.length });
            navigate('/login');
            return;
          }

          const writtenParams = new URLSearchParams({
            username: writtenUsername,
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter
          });

          console.log('🔍 [SELECT_SUBJECT DEBUG] Fetching written question with parameters:', {
            username: writtenUsername,
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter,
            rawClassName: selectedClass,
            rawSubject: selectedSubject
          });
          console.log('🔍 [SELECT_SUBJECT DEBUG] Written question endpoint:', `${EXAM_API_BASE_URL}${API_ENDPOINTS.WRITTEN_QUESTION}`);
          console.log('🔍 [SELECT_SUBJECT DEBUG] Query parameters:', writtenParams.toString());

          const writtenResponse = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.WRITTEN_QUESTION}?${writtenParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${writtenToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('🔍 [SELECT_SUBJECT DEBUG] Written question response status:', writtenResponse.status);

          if (writtenResponse.ok) {
            const writtenData = await writtenResponse.json();
            console.log('🔍 [SELECT_SUBJECT DEBUG] Written question response data:', writtenData);
            
            // Extract question from the response
            const extractedQuestion = writtenData.question || writtenData.questions?.[0]?.question || 'No question found.';
            
            // Navigate to WrittenQuestion with fetched question
            navigate(ROUTES.WRITTEN, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                question: extractedQuestion
              } 
            });
          } else {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch written question, status:', writtenResponse.status);
            const errorText = await writtenResponse.text();
            console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
            setError('Failed to fetch written question. Please try again.');
          }
          return;
        case 'notes':
          console.log('🔍 [SELECT_SUBJECT DEBUG] Processing notes mode');
          const notesToken = getFormattedToken();
          const notesUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
          
          if (!notesToken || !notesUsername) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Missing authentication for notes:', { token: !!notesToken, username: !!notesUsername });
            navigate('/login');
            return;
          }

          // Additional validation for token
          if (notesToken.length < 10) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Token seems too short for notes:', { tokenLength: notesToken.length });
            navigate('/login');
            return;
          }

          const notesParams = new URLSearchParams({
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter
          });

          console.log('🔍 [SELECT_SUBJECT DEBUG] Fetching notes with parameters:', {
            className: mapClassForExamAPI(selectedClass),
            subject: mapSubjectForExamAPI(selectedSubject),
            chapter: selectedChapter,
            rawClassName: selectedClass,
            rawSubject: selectedSubject
          });
          console.log('🔍 [SELECT_SUBJECT DEBUG] Notes endpoint:', `${LEARNING_API_BASE_URL}${API_ENDPOINTS.GENERATE_NOTE}`);
          console.log('🔍 [SELECT_SUBJECT DEBUG] Query parameters:', notesParams.toString());

          const notesResponse = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.GENERATE_NOTE}?${notesParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${notesToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('🔍 [SELECT_SUBJECT DEBUG] Notes response status:', notesResponse.status);

          if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            console.log('🔍 [SELECT_SUBJECT DEBUG] Notes response data:', notesData);
            
            // Extract notes from the response
            let extractedNotes = [];
            if (notesData.note && Array.isArray(notesData.note)) {
              extractedNotes = notesData.note;
            } else if (notesData.note && typeof notesData.note === 'string') {
              extractedNotes = [notesData.note];
            } else if (notesData.note && typeof notesData.note === 'object' && notesData.note !== null) {
              if (notesData.note.hasOwnProperty('note ')) {
                extractedNotes = [notesData.note['note ']];
              } else {
                extractedNotes = Object.values(notesData.note);
              }
            } else if (notesData.notes && Array.isArray(notesData.notes)) {
              extractedNotes = notesData.notes;
            } else if (notesData.lesson && Array.isArray(notesData.lesson)) {
              extractedNotes = notesData.lesson;
            } else if (notesData.content && Array.isArray(notesData.content)) {
              extractedNotes = notesData.content;
            }
            
            // Navigate to ShowNotes with fetched notes
            navigate(ROUTES.SHOW_NOTES, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                note: extractedNotes,
                skipInitialLoading: true
              } 
            });
          } else {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch notes, status:', notesResponse.status);
            const errorText = await notesResponse.text();
            console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
            setError('Failed to fetch notes. Please try again.');
          }
          return;
        default:
          setError('Invalid mode');
          break;
      }
    } catch (error) {
      console.error('🔍 [SELECT_SUBJECT DEBUG] Error in handleSubmit:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      // Only cleanup if this was the first request
      if (requestId === firstRequestId) {
        setIsLoading(false);
        setCurrentRequestId(null);
        setFirstRequestId(null);
        window.firstRequestId = null;
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
            onSubmit={handleSubmit}
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