import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaBook, FaQuestionCircle, FaPen, FaSpinner, FaGraduationCap, FaGlobe,FaFlask, FaChartLine, FaBriefcase, FaLeaf, FaHistory, FaStickyNote } from "react-icons/fa";
import { GiAtom } from "react-icons/gi";
import { API_BASE_URL, EXAM_API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, ROUTES, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../../config';
import { useDarkTheme } from '../Common/DarkThemeProvider';
import flowLogoLight from '../../assets/flow-main-nobg.png';
import flowLogoDark from '../../assets/flow-dark.png';
import { useSearchParams } from 'react-router-dom';
import SelectionForm from './SelectionForm';

const SelectSubject = ({ mode: propMode }) => {

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode');
  const mode = queryMode || location.state?.mode || propMode;
  
  
  const navigate = useNavigate();
  
  // Test navigation function
  const { isDarkMode } = useDarkTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [firstRequestId, setFirstRequestId] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [challengeId, setChallengeId] = useState('');
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState('');
  const [challengeData, setChallengeData] = useState(null);
  const [attendChallengeId, setAttendChallengeId] = useState('');
  const [isAttendLoading, setIsAttendLoading] = useState(false);
  const [showAttendModal, setShowAttendModal] = useState(false);
  const [copiedChallenge, setCopiedChallenge] = useState(false);

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

  // Helper function to test API connectivity - simplified for React 19 compatibility
  const testApiConnectivity = async (baseUrl) => {
    try {
      // Only test the root endpoint to avoid 404 errors
      const response = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
              return response.ok;
    } catch (error) {
              return false;
    }
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

  // Track location changes
  useEffect(() => {
              }, [location]);

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

  const handleGenerateChallenge = async () => {
    try {
      setChallengeMessage('');
      setChallengeId('');
      setChallengeData(null);
      if (!selectedClass || !selectedSubject || !selectedChapter) {
        setError('Please select all fields');
        return;
      }
      const token = getFormattedToken();
      const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
      if (!token || !username) {
        navigate('/login');
        return;
      }
      if (token.length < 10) {
        navigate('/login');
        return;
      }
      setIsChallengeLoading(true);
      const params = new URLSearchParams({
        username,
        className: mapClassForExamAPI(selectedClass),
        subject: mapSubjectForExamAPI(selectedSubject),
        chapter: selectedChapter,
        count: '2'
      });
      const url = `${EXAM_API_BASE_URL}${API_ENDPOINTS.GENERATE_CHALLENGE}?${params.toString()}`;
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Failed with status ${resp.status}`);
      }
      const data = await resp.json();
      if (data?.challengeId) {
        setChallengeId(data.challengeId);
        setChallengeData(data);
        setChallengeMessage('Challenge created! Share the ID with your friend.');
      } else {
        throw new Error('Challenge ID not returned by server');
      }
    } catch (err) {
      setError('Could not create challenge. Please try again.');
      console.error('[CHALLENGE] generate error:', err);
    } finally {
      setIsChallengeLoading(false);
    }
  };

  const handleCopyChallengeId = async () => {
    if (!challengeId) return;
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext !== false) {
        await navigator.clipboard.writeText(challengeId);
      } else {
        // Fallback: prompt user to copy manually if Clipboard API isn't available
        window.prompt('Copy this challenge ID:', challengeId);
      }
      setChallengeMessage('Copied challenge ID to clipboard');
      setCopiedChallenge(true);
      setTimeout(() => {
        setChallengeMessage('');
        setCopiedChallenge(false);
      }, 1500);
    } catch (err) {
      console.error('[CHALLENGE] Clipboard copy failed:', err);
    }
  };

  const handleAttendChallenge = async () => {
    try {
      if (!attendChallengeId || attendChallengeId.trim().length === 0) {
        setError('Please enter a valid challenge ID');
        return;
      }
      const token = getFormattedToken();
      const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
      if (!token || !username) {
        navigate('/login');
        return;
      }
      if (token.length < 10) {
        navigate('/login');
        return;
      }
      setIsAttendLoading(true);
      const params = new URLSearchParams({ challengeId: attendChallengeId.trim() });
      const url = `${EXAM_API_BASE_URL}${API_ENDPOINTS.ATTEND_CHALLENGE}?${params.toString()}`;
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Failed with status ${resp.status}`);
      }
      const data = await resp.json();
      const questions = data.mcqs || data.questions || data;
      if (!questions || (Array.isArray(questions) && questions.length === 0)) {
        throw new Error('No questions returned for this challenge');
      }
      // Navigate to quiz with challenge questions
      navigate(ROUTES.QUIZ, {
        state: {
          className: selectedClass || undefined,
          subject: selectedSubject || undefined,
          chapter: selectedChapter || undefined,
          questions,
          challengeId: attendChallengeId.trim(),
          isChallenge: true,
          isAttendee: true,
          count: Array.isArray(questions) ? questions.length : undefined
        }
      });
    } catch (err) {
      console.error('[CHALLENGE] attend error:', err);
      setError('Could not attend challenge. Please verify the ID and try again.');
    } finally {
      setIsAttendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
                
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      setError('Please select all fields');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) {
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
    setHasNavigated(false);

    try {
      // For quiz mode, use challenge questions if generated; otherwise fetch
      if (mode === 'test' || mode === 'mcq') {
                  const token = getFormattedToken();
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        
        
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

        // If we already have a generated challenge, navigate using that data
        if (challengeData?.mcqs?.length) {
          console.log('🔍 [SELECT_SUBJECT DEBUG] Using generated challenge for quiz:', {
            challengeId,
            mcqCount: challengeData.mcqs.length
          });
          setHasNavigated(true);
          setIsLoading(false);
          setCurrentRequestId(null);
          setFirstRequestId(null);
          window.firstRequestId = null;
          try {
            navigate(ROUTES.QUIZ, {
              state: {
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                questions: challengeData.mcqs,
                challengeId: challengeId,
                isChallenge: true,
                count: challengeData.mcqs.length
              }
            });
                        } catch (navError) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Navigation to quiz using challenge failed:', navError);
          }
          return;
        }

        console.log('🔍 [SELECT_SUBJECT DEBUG] Fetching questions for quiz with parameters:', {
          username,
          className: mapClassForExamAPI(selectedClass),
          subject: mapSubjectForExamAPI(selectedSubject),
          chapter: selectedChapter,
          rawClassName: selectedClass,
          rawSubject: selectedSubject
        });
                              
        const headers = {
          'Authorization': `Bearer ${token}`
        };

          
        const response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.MCQ_QUESTIONS}?${params.toString()}`, {
          method: 'POST',
          headers
        });

                    
        if (response.ok) {
          const data = await response.json();
                      console.log('🔍 [SELECT_SUBJECT DEBUG] Questions response structure:', {
            hasMcqs: !!data.mcqs,
            hasQuestions: !!data.questions,
            mcqsLength: data.mcqs?.length,
            questionsLength: data.questions?.length,
            dataKeys: Object.keys(data),
            dataType: typeof data
          });
          
          // Navigate to quiz with fetched questions
          console.log('🔍 [SELECT_SUBJECT DEBUG] Navigating to quiz with state:', {
            route: ROUTES.QUIZ,
            state: { 
              className: selectedClass,
              subject: selectedSubject,
              chapter: selectedChapter,
              questions: data.mcqs || data.questions || data,
              difficultyLevel: data.difficultyLevel
            }
          });
          
          // Set navigation flag and clear loading state before navigation
          setHasNavigated(true);
          setIsLoading(false);
          setCurrentRequestId(null);
          setFirstRequestId(null);
          window.firstRequestId = null;
          
          try {
            navigate(ROUTES.QUIZ, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                questions: data.mcqs || data.questions || data,
                difficultyLevel: data.difficultyLevel
              } 
            });
                        } catch (navError) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Navigation to quiz failed:', navError);
          }
        } else {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch questions, status:', response.status);
          const errorText = await response.text();
          console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
          if (currentRequestId === requestId) {
            setError('Failed to fetch quiz questions. Please try again.');
          }
        }
        return;
      }

      // For revise mode, fetch previous mistakes first
      if (mode === 'revise') {
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
                            
        const fullUrl = `${EXAM_API_BASE_URL}${API_ENDPOINTS.PREVIOUS_MCQ}?${params.toString()}`;
                                      console.log('🔍 [SELECT_SUBJECT DEBUG] Request headers:', {
          'Authorization': `Bearer ${token.substring(0, 20)}...`,
          'Content-Type': 'application/json'
        });

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

          
        if (response.ok) {
          const data = await response.json();
                      console.log('🔍 [SELECT_SUBJECT DEBUG] Previous mistakes response structure:', {
            hasMcqs: !!data.mcqs,
            hasQuestions: !!data.questions,
            mcqsLength: data.mcqs?.length,
            questionsLength: data.questions?.length,
            dataKeys: Object.keys(data),
            dataType: typeof data
          });
          
        
          // Set navigation flag and clear loading state before navigation
          setHasNavigated(true);
          setIsLoading(false);
          setCurrentRequestId(null);
          setFirstRequestId(null);
          window.firstRequestId = null;
          
          try {
            navigate(ROUTES.PREV_MISTAKES, { 
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                questions: data.mcqs || data.questions || data,
                count: 5
              } 
            });
                        } catch (navError) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Navigation to prev mistakes failed:', navError);
          }
        } else {
          console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch previous mistakes, status:', response.status);
          const errorText = await response.text();
          console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
          
          if (currentRequestId === requestId) {
            // Check if it's the "not enough questions practiced" error
            if (errorText.includes('Not enough questions practiced')) {
              setError('No previous mistakes found for this subject. Please practice some questions first and then try again.');
            } else {
              setError('Failed to fetch previous mistakes. Please try again.');
            }
            setIsLoading(false);
          }
        }
        return;
      }

              // Navigate based on mode (for non-quiz modes)
      switch (mode) {
        case 'learn':
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
                        
          const learnResponse = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.LEARN}?${learnParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${learnToken}`,
              'Content-Type': 'application/json'
            }
          });

            
          if (learnResponse.ok) {
            const learnData = await learnResponse.json();
                          console.log('🔍 [SELECT_SUBJECT DEBUG] Learn response structure:', {
              hasContent: !!learnData.content,
              hasLessons: !!learnData.lessons,
              hasChapterTitle: !!learnData.chapterTitle,
              hasTitle: !!learnData.title,
              contentType: typeof learnData.content,
              lessonsType: typeof learnData.lessons,
              isContentArray: Array.isArray(learnData.content),
              isLessonsArray: Array.isArray(learnData.lessons),
              dataKeys: Object.keys(learnData)
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
            console.log('🔍 [SELECT_SUBJECT DEBUG] Navigating to learn with state:', {
              route: ROUTES.LEARN,
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                content: extractedContent,
                chapterTitle: extractedTitle
              }
            });
            
            // Set navigation flag and clear loading state before navigation
            setHasNavigated(true);
            setIsLoading(false);
            setCurrentRequestId(null);
            setFirstRequestId(null);
            window.firstRequestId = null;
            
            try {
              navigate(ROUTES.LEARN, { 
                state: { 
                  className: selectedClass,
                  subject: selectedSubject,
                  chapter: selectedChapter,
                  content: extractedContent,
                  chapterTitle: extractedTitle
                } 
              });
                            } catch (navError) {
              console.error('🔍 [SELECT_SUBJECT DEBUG] Navigation to learn failed:', navError);
            }
          } else {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch learning content, status:', learnResponse.status);
            const errorText = await learnResponse.text();
            console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
            if (currentRequestId === requestId) {
              setError('Failed to fetch learning content. Please try again.');
              setIsLoading(false);
            }
          }
          return;
        case 'written':
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
                        
          const writtenResponse = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.WRITTEN_QUESTION}?${writtenParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${writtenToken}`,
              'Content-Type': 'application/json'
            }
          });

            
          if (writtenResponse.ok) {
            const writtenData = await writtenResponse.json();
                          console.log('🔍 [SELECT_SUBJECT DEBUG] Written question response structure:', {
              hasQuestion: !!writtenData.question,
              hasQuestions: !!writtenData.questions,
              questionLength: writtenData.question?.length,
              questionsLength: writtenData.questions?.length,
              dataKeys: Object.keys(writtenData),
              dataType: typeof writtenData
            });
            
            // Extract question from the response
            const extractedQuestion = writtenData.question || writtenData.questions?.[0]?.question || 'No question found.';
            
            // Navigate to WrittenQuestion with fetched question
            console.log('🔍 [SELECT_SUBJECT DEBUG] Navigating to written question with state:', {
              route: ROUTES.WRITTEN,
              state: { 
                className: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                question: extractedQuestion
              }
            });
            
            // Set navigation flag and clear loading state before navigation
            setHasNavigated(true);
            setIsLoading(false);
            setCurrentRequestId(null);
            setFirstRequestId(null);
            window.firstRequestId = null;
            
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
            if (currentRequestId === requestId) {
              setError('Failed to fetch written question. Please try again.');
              setIsLoading(false);
            }
          }
          return;
        case 'notes':
                      const notesToken = getFormattedToken();
          const notesUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
          
          console.log('🔍 [SELECT_SUBJECT DEBUG] Notes mode - Authentication check:', {
            hasToken: !!notesToken,
            tokenLength: notesToken?.length,
            hasUsername: !!notesUsername,
            username: notesUsername
          });
          
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

          // Check if API base URL is configured
          if (!LEARNING_API_BASE_URL) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] LEARNING_API_BASE_URL is not configured');
            setError('API configuration error: LEARNING_API_BASE_URL is not set. Please check your environment variables.');
            setIsLoading(false);
            return;
          }
          
          // Check if API base URL is a valid URL
          if (!LEARNING_API_BASE_URL.startsWith('http://') && !LEARNING_API_BASE_URL.startsWith('https://')) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] LEARNING_API_BASE_URL is not a valid URL:', LEARNING_API_BASE_URL);
            setError(`Invalid API base URL configuration: "${LEARNING_API_BASE_URL}". URL must start with http:// or https://`);
            setIsLoading(false);
            return;
          }
          
                      console.log('🔍 [SELECT_SUBJECT DEBUG] Environment variables:', {
            VITE_LEARNING_API_BASE_URL: import.meta.env.VITE_LEARNING_API_BASE_URL,
            VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
            VITE_EXAM_API_BASE_URL: import.meta.env.VITE_EXAM_API_BASE_URL,
            NODE_ENV: import.meta.env.NODE_ENV,
            MODE: import.meta.env.MODE
          });
          
          // Debug API_ENDPOINTS
                                  
          // Ensure proper parameter encoding
          const mappedClassName = mapClassForExamAPI(selectedClass);
          const mappedSubject = mapSubjectForExamAPI(selectedSubject);
          
          console.log('🔍 [SELECT_SUBJECT DEBUG] Mapping results:', {
            originalClass: selectedClass,
            mappedClassName,
            originalSubject: selectedSubject,
            mappedSubject,
            mappingFunctions: {
              mapClassForExamAPI: typeof mapClassForExamAPI,
              mapSubjectForExamAPI: typeof mapSubjectForExamAPI
            }
          });
          
          console.log('🔍 [SELECT_SUBJECT DEBUG] Raw parameters:', {
            selectedClass,
            selectedSubject,
            selectedChapter,
            selectedChapterType: typeof selectedChapter,
            selectedChapterValue: selectedChapter,
            mappedClassName,
            mappedSubject
          });
          
          // Validate and clean parameters
          if (!selectedChapter || selectedChapter === '' || selectedChapter === null || selectedChapter === undefined) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] selectedChapter is invalid:', selectedChapter);
            setError('Please select a valid chapter.');
            setIsLoading(false);
            return;
          }
          
          // Debug before URL construction
          console.log('🔍 [SELECT_SUBJECT DEBUG] Pre-URL construction values:', {
            LEARNING_API_BASE_URL,
            API_ENDPOINTS_GENERATE_NOTE: API_ENDPOINTS.GENERATE_NOTE,
            selectedClass,
            selectedSubject,
            selectedChapter,
            selectedChapterType: typeof selectedChapter,
            mappedClassName,
            mappedSubject
          });
          
          // Build URL manually to avoid potential issues with buildApiUrl
          // Use direct URL construction for reliability
          const baseUrl = LEARNING_API_BASE_URL.endsWith('/') 
            ? LEARNING_API_BASE_URL.slice(0, -1) 
            : LEARNING_API_BASE_URL;
          const endpoint = API_ENDPOINTS.GENERATE_NOTE.startsWith('/') 
            ? API_ENDPOINTS.GENERATE_NOTE 
            : `/${API_ENDPOINTS.GENERATE_NOTE}`;
          
          
          // Create URLSearchParams for proper encoding
          const searchParams = new URLSearchParams();
          searchParams.append('className', mappedClassName);
          searchParams.append('subject', mappedSubject);
          searchParams.append('chapter', selectedChapter.toString());
          
          const fullUrl = `${baseUrl}${endpoint}?${searchParams.toString()}`;
          
                                  
            
          // Test API connectivity first
                      const isConnected = await testApiConnectivity(LEARNING_API_BASE_URL);
            
          try {
            // Use only the primary endpoint
            const endpoint = API_ENDPOINTS.GENERATE_NOTE;
                          
            // Manual URL construction
            const currentEndpoint = endpoint.startsWith('/') 
              ? endpoint 
              : `/${endpoint}`;
            
            const currentSearchParams = new URLSearchParams();
            currentSearchParams.append('className', mappedClassName);
            currentSearchParams.append('subject', mappedSubject);
            currentSearchParams.append('chapter', selectedChapter.toString());
            
            const currentUrl = `${baseUrl}${currentEndpoint}?${currentSearchParams.toString()}`;
            
                          
            // Make the API request
            const response = await fetch(currentUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${notesToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              mode: 'cors'
            });
            
                          
            if (response.ok) {
              const notesData = await response.json();
                              console.log('🔍 [SELECT_SUBJECT DEBUG] Notes response structure:', {
                hasNote: !!notesData.note,
                hasNotes: !!notesData.notes,
                hasLesson: !!notesData.lesson,
                hasContent: !!notesData.content,
                noteType: typeof notesData.note,
                notesType: typeof notesData.notes,
                lessonType: typeof notesData.lesson,
                contentType: typeof notesData.content,
                isNoteArray: Array.isArray(notesData.note),
                isNotesArray: Array.isArray(notesData.notes),
                isLessonArray: Array.isArray(notesData.lesson),
                isContentArray: Array.isArray(notesData.content),
                dataKeys: Object.keys(notesData)
              });
              
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
              } else {
                console.error('🔍 [SELECT_SUBJECT DEBUG] No valid notes found in response:', notesData);
                setError('No notes available for this selection. Please try a different chapter or subject.');
                setIsLoading(false);
                return;
              }
              
                              
              // Navigate to ShowNotes with fetched notes
              console.log('🔍 [SELECT_SUBJECT DEBUG] Navigating to show notes with state:', {
                route: ROUTES.SHOW_NOTES,
                state: { 
                  className: selectedClass,
                  subject: selectedSubject,
                  chapter: selectedChapter,
                  note: extractedNotes,
                  skipInitialLoading: true
                }
              });
              
              // Set navigation flag and clear loading state before navigation
              setHasNavigated(true);
              setIsLoading(false);
              setCurrentRequestId(null);
              setFirstRequestId(null);
              window.firstRequestId = null;
              
              try {
                navigate(ROUTES.SHOW_NOTES, { 
                  state: { 
                    className: selectedClass,
                    subject: selectedSubject,
                    chapter: selectedChapter,
                    note: extractedNotes,
                    skipInitialLoading: true
                  } 
                });
                                } catch (navError) {
                console.error('🔍 [SELECT_SUBJECT DEBUG] Navigation to show notes failed:', navError);
              }
                      } else {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Failed to fetch notes, status:', response.status);
            const errorText = await response.text();
            console.error('🔍 [SELECT_SUBJECT DEBUG] Error response:', errorText);
            
            // Only show error if this is still the current request
            if (currentRequestId === requestId) {
              // Provide more specific error messages
              if (response.status === 404) {
                setError('Notes not found for this selection. Please try a different chapter or subject.');
              } else if (response.status === 401) {
                setError('Authentication failed. Please log in again.');
                navigate('/login');
              } else if (response.status === 500) {
                setError('Server error occurred. Please try again later.');
              } else {
                setError(`Failed to fetch notes. Server responded with status ${response.status}. Please try again.`);
              }
              setIsLoading(false);
            }
          }
          } catch (error) {
            console.error('🔍 [SELECT_SUBJECT DEBUG] Exception during notes fetch:', error);
            console.error('🔍 [SELECT_SUBJECT DEBUG] Error name:', error.name);
            console.error('🔍 [SELECT_SUBJECT DEBUG] Error message:', error.message);
            
            // Only show error if the request actually failed and we're not navigating away
            if (currentRequestId === requestId) {
              // Provide more specific error messages based on error type
              if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setError('Network error: Unable to connect to the server. Please check your internet connection and try again.');
              } else if (error.name === 'TypeError' && error.message.includes('URL')) {
                setError('Invalid URL format. Please check your API configuration.');
              } else {
                setError(`Connection error: ${error.message}. Please check your connection and try again.`);
              }
              setIsLoading(false);
            }
          }
          return;
        default:
          setError('Invalid mode');
          break;
      }
    } catch (error) {
      console.error('🔍 [SELECT_SUBJECT DEBUG] Error in handleSubmit:', error);
      // Only show error if this is still the current request and we haven't navigated away
      if (currentRequestId === requestId) {
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    } finally {
      // Only cleanup if this was the first request and we haven't navigated away
      if (requestId === firstRequestId && !hasNavigated) {
                  setIsLoading(false);
        setCurrentRequestId(null);
        setFirstRequestId(null);
        window.firstRequestId = null;
      } else {
                }
      // Reset navigation flag for next request
      setHasNavigated(false);
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

      {/* Custom Error Alert Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl shadow-2xl border-2 ${
            isDarkMode 
              ? 'bg-gray-800 border-red-500' 
              : 'bg-white border-red-400'
          }`}>
            {/* Alert Header */}
            <div className={`px-6 py-4 border-b ${
              isDarkMode 
                ? 'border-gray-700 bg-gradient-to-r from-red-900/20 to-red-800/20' 
                : 'border-gray-200 bg-gradient-to-r from-red-50 to-red-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Oops! Something went wrong
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    Please review the details below
                  </p>
                </div>
              </div>
            </div>

            {/* Alert Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className={`text-base leading-relaxed ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {error}
                </p>
              </div>
            </div>

            {/* Alert Footer */}
            <div className={`px-6 py-4 border-t ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-800/50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex gap-3">
                <button 
                  onClick={() => setError('')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  Got it
                </button>
                <button 
                  onClick={() => {
                    setError('');
                    navigate('/main');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttendModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAttendModal(false)}></div>
          <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Enter Challenge ID</h3>
              <button
                onClick={() => setShowAttendModal(false)}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Paste challenge ID"
              value={attendChallengeId}
              onChange={(e) => setAttendChallengeId(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-purple-600'
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-500'
              }`}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAttendChallenge}
                disabled={isAttendLoading || !attendChallengeId}
                className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                  isDarkMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                    : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                }`}
              >
                {isAttendLoading ? 'Joining...' : 'Join Challenge'}
              </button>
              <button
                onClick={() => setShowAttendModal(false)}
                className={`px-4 py-3 rounded-lg font-medium border ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
            </div>
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

          {mode === 'mcq' && (
            <div className="max-w-lg mx-auto mt-4">
              <div className={`text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>or</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateChallenge}
                  disabled={!selectedClass || !selectedSubject || !selectedChapter || isChallengeLoading}
                  className={`w-full px-4 py-3 rounded-lg font-medium border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 disabled:opacity-50'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                  }`}
                >
                  {isChallengeLoading ? 'Creating challenge...' : 'Challenge a friend'}
                </button>
                <button
                  onClick={() => setShowAttendModal(true)}
                  className={`w-full px-4 py-3 rounded-lg font-medium border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Attend a challenge
                </button>
              </div>
              
              {challengeId && (
                <div className={`mt-4 p-4 rounded-lg border flex items-center justify-between ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Challenge ID</div>
                    <div className="font-mono text-base mt-1">{challengeId}</div>
                    {challengeMessage && (
                      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{challengeMessage}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyChallengeId}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {copiedChallenge ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SelectSubject;