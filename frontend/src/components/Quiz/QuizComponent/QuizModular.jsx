import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { API_BASE_URL, EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../../../config';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import '../../../css/QuizDesign.css';

// Import sub-components
import Header from './Header';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import QuizContent from './QuizContent';
import ScoreDisplay from './ScoreDisplay';

const QuizModular = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useDarkTheme();

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

    // State management
    const [questions, setQuestions] = useState([]);
    const [missedQuestions, setMissedQuestions] = useState([]);
    const [answerArray, setAnswerArray] = useState([]);
    const [index, setIndex] = useState(0);
    const [question, setQuestion] = useState(null);
    const [lock, setLock] = useState(false);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(null);
    const [error, setError] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [hintTaken, setHintTaken] = useState(false);
    const [quizInfo, setQuizInfo] = useState({
        class: location.state?.className || location.state?.class || 'Class 9',
        subject: location.state?.subject || 'Science',
        chapter: location.state?.chapter || '1'
    });

    // Refs for option elements
    const Option1 = useRef(null);
    const Option2 = useRef(null);
    const Option3 = useRef(null);
    const Option4 = useRef(null);
    const options = [Option1, Option2, Option3, Option4];

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const role = localStorage.getItem(STORAGE_KEYS.ROLE);
        
        if (!token || !username) {
            navigate('/login');
            return;
        }
        
        // Check if user has the correct role for this page (Quiz is student-only)
        if (role !== 'STUDENT') {
            if (role === 'TEACHER') {
                navigate('/teacher');
            } else {
                navigate('/login');
            }
            return;
        }
    }, [navigate]);

    // Fetch questions function
    const fetchQuestions = async () => {
            // Set loading to true when starting to fetch questions
            setIsLoading(true);
            setError(null); // Clear any previous errors
            
            // Check authentication before fetching
            const token = getFormattedToken();
            const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
            
            if (!token || !username) {

                navigate('/login');
                return;
            }

            // Additional validation for token
            if (token.length < 10) {

                navigate('/login');
                return;
            }
            
            // Use questions from state or fetch from API
            let initialQuestions = location.state?.questions || [];
            let stateDifficultyLevel = location.state?.difficultyLevel;
            
            if (!initialQuestions || initialQuestions.length === 0) {
                // Fetch questions from API
                const className = location.state?.className || location.state?.class || 'Class 9';
                const subject = location.state?.subject || 'Science';
                const chapter = location.state?.chapter || '1';
                const params = new URLSearchParams({
                    username,
                    className: mapClassForExamAPI(className),
                    subject: mapSubjectForExamAPI(subject),
                    chapter,
                    count: '5' // Default count of 5 questions
                });
                
                // Debug: Log the parameters and endpoint for fetching questions




                
                try {
                    const response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.MCQ_QUESTIONS}?${params.toString()}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log('🔍 [QUIZ DEBUG] Questions response status:', response.status);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('🔍 [QUIZ DEBUG] Questions response data:', data);
                        initialQuestions = data.mcqs || data.questions || data;
                        if (data.difficultyLevel) {
                            setDifficultyLevel(data.difficultyLevel);
                        }
                    } else {
                        console.error('🔍 [QUIZ DEBUG] Failed to fetch questions, status:', response.status);
                        const errorText = await response.text();
                        console.error('🔍 [QUIZ DEBUG] Error response:', errorText);
                        setError('Unable to load quiz questions. Please try again.');
                    }
                } catch (error) {
                    console.error('🔍 [QUIZ DEBUG] Error fetching questions:', error);
                    setError('Unable to load quiz questions. Please try again.');
                }
            } else {
                console.log('🔍 [QUIZ DEBUG] Using questions from state, count:', initialQuestions.length);
                console.log('🔍 [QUIZ DEBUG] Questions from state:', initialQuestions);
                console.log('🔍 [QUIZ DEBUG] State parameters:', {
                    className: location.state?.className,
                    subject: location.state?.subject,
                    chapter: location.state?.chapter
                });
            }
            
            if (initialQuestions && initialQuestions.length > 0) {
                setQuestions(initialQuestions);
                setQuestion(initialQuestions[0]);
                if (stateDifficultyLevel) {
                    setDifficultyLevel(stateDifficultyLevel);
                }
            } else {
                setError('Unable to load quiz questions. Please try again.');
            }
            setIsLoading(false);
        };

    // Fetch questions on mount
    useEffect(() => {
        fetchQuestions();
    }, [location.state, navigate]);

    // Update current question when index or questions change
    useEffect(() => {
        if (questions.length > 0) {
            setQuestion(questions[index]);
            
            // Reset all option styling when question changes
            options.forEach((option) => {
                if (option.current) {
                    // Remove all answer styling classes
                    option.current.classList.remove(
                        "bg-green-100", "border-green-500", "text-green-800", "border-l-4",
                        "bg-red-100", "border-red-500", "text-red-800", "border-l-4"
                    );
                    
                    // Restore default styling based on dark mode
                    if (isDarkMode) {
                        option.current.classList.add("bg-gray-700", "border-gray-600", "text-gray-200");
                        option.current.classList.remove("bg-gray-50", "border-gray-200", "text-[#343434]");
                    } else {
                        option.current.classList.add("bg-gray-50", "border-gray-200", "text-[#343434]");
                        option.current.classList.remove("bg-gray-700", "border-gray-600", "text-gray-200");
                    }
                    
                    // Reset the innerHTML to original text (remove accessibility indicators)
                    const originalText = option.current.querySelector('span')?.textContent || option.current.textContent;
                    option.current.innerHTML = originalText;
                }
            });
        }
    }, [index, questions, isDarkMode]);

    // Helper functions
    const highlightAnswer = () => {
        Object.entries(question.options).forEach(([key, value], i) => {
            const li = options[i].current;
            if (key === question.answer) {
                // Remove base background classes and add green styling
                li.classList.remove("bg-gray-50", "bg-gray-700", "hover:bg-gray-100", "hover:bg-gray-600");
                li.classList.add("bg-green-100", "border-green-500", "text-green-800", "border-l-4");
                
                // Add accessibility indicators for correct answer
                const originalText = li.textContent;
                li.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span>${originalText}</span>
                        <div class="flex items-center ml-auto">
                            <FaCheck className="text-green-600 mr-1" />
                            <span class="text-xs font-semibold text-green-700">CORRECT</span>
                        </div>
                    </div>
                `;
            } else {
                // Remove base background classes and add red styling
                li.classList.remove("bg-gray-50", "bg-gray-700", "hover:bg-gray-100", "hover:bg-gray-600");
                li.classList.add("bg-red-100", "border-red-500", "text-red-800", "border-l-4");
                
                // Add accessibility indicators for incorrect answer
                const originalText = li.textContent;
                li.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span>${originalText}</span>
                        <div class="flex items-center ml-auto">
                            <FaTimes className="text-red-600 mr-1" />
                            <span class="text-xs font-semibold text-red-700">INCORRECT</span>
                        </div>
                    </div>
                `;
            }
        });
    };

    const checkAns = async (e, ans) => {
        if (lock) return;
        setLock(true);
        
        // Always target the list item, not the text inside it
        const listItem = e.target.closest('li');
        if (!listItem) return;
        
        console.log('🔍 [QUIZ DEBUG] Answer clicked:', {
            selectedAnswer: ans,
            correctAnswer: question.answer,
            isCorrect: question.answer === ans,
            questionText: question.question
        });
        
        if (question.answer === ans) {
            console.log('🔍 [QUIZ DEBUG] Correct answer! Adding green classes');
            // Remove base background classes and add green styling
            listItem.classList.remove("bg-gray-50", "bg-gray-700", "hover:bg-gray-100", "hover:bg-gray-600");
            listItem.classList.add("bg-green-100", "border-green-500", "text-green-800", "border-l-4");
            
            // Add accessibility indicators for correct answer
            const originalText = listItem.textContent;
            listItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <span>${originalText}</span>
                    <div class="flex items-center ml-auto">
                        <FaCheck className="text-green-600 mr-1" />
                        <span class="text-xs font-semibold text-green-700">CORRECT</span>
                    </div>
                </div>
            `;
            
            setScore(prev => prev + 1);
            setAnswerArray(prev => [...prev, 1]);
            setIsCorrect(true);
        } else {
            console.log('🔍 [QUIZ DEBUG] Wrong answer! Adding red classes to selected option');
            // Remove base background classes and add red styling
            listItem.classList.remove("bg-gray-50", "bg-gray-700", "hover:bg-gray-100", "hover:bg-gray-600");
            listItem.classList.add("bg-red-100", "border-red-500", "text-red-800", "border-l-4");
            
            // Add accessibility indicators for wrong answer
            const originalText = listItem.textContent;
            listItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <span>${originalText}</span>
                    <div class="flex items-center ml-auto">
                        <FaTimes className="text-red-600 mr-1" />
                        <span class="text-xs font-semibold text-red-700">INCORRECT</span>
                    </div>
                </div>
            `;
            
            // Also highlight the correct answer in green
            Object.entries(question.options).forEach(([key, value], i) => {
                if (key === question.answer) {
                    // Remove base background classes and add green styling
                    options[i].current.classList.remove("bg-gray-50", "bg-gray-700", "hover:bg-gray-100", "hover:bg-gray-600");
                    options[i].current.classList.add("bg-green-100", "border-green-500", "text-green-800", "border-l-4");
                    
                    // Add accessibility indicators for correct answer
                    const correctOriginalText = options[i].current.textContent;
                    options[i].current.innerHTML = `
                        <div class="flex items-center justify-between">
                            <span>${correctOriginalText}</span>
                            <div class="flex items-center ml-auto">
                                <FaCheck className="text-green-600 mr-1" />
                                <span class="text-xs font-semibold text-green-700">CORRECT</span>
                            </div>
                        </div>
                    `;
                }
            });
            
            setAnswerArray(prev => [...prev, 0]);
            setMissedQuestions(prev => [...prev, question]);
            setIsCorrect(false);
        }

        // For the last question, show a "Submit Quiz" button instead of "Next"
        if (index === questions.length - 1) {
            // Don't submit automatically - just show the answer and enable submit button
            console.log('🔍 [QUIZ DEBUG] Last question answered - ready to submit');
        }
        // Don't automatically move to next question - wait for user to click Next button
    };

    const reset = () => {
        navigate('/main');
    };

    const handleNext = () => {
        if (!lock) return;
        
        setShowHint(false);
        setShowExplanation(false);
        setIsCorrect(null);
        setHintTaken(false); // Reset hint taken for new question
        setIndex((prev) => prev + 1);
        setLock(false);

        // Reset all option styling to default state
        options.forEach((option) => {
            if (option.current) {
                // Remove all answer styling classes
                option.current.classList.remove(
                    "bg-green-100", "border-green-500", "text-green-800", "border-l-4",
                    "bg-red-100", "border-red-500", "text-red-800", "border-l-4"
                );
                
                // Restore default styling based on dark mode
                if (isDarkMode) {
                    option.current.classList.add("bg-gray-700", "border-gray-600", "text-gray-200");
                    option.current.classList.remove("bg-gray-50", "border-gray-200", "text-[#343434]");
                } else {
                    option.current.classList.add("bg-gray-50", "border-gray-200", "text-[#343434]");
                    option.current.classList.remove("bg-gray-700", "border-gray-600", "text-gray-200");
                }
                
                // Reset the innerHTML to original text (remove accessibility indicators)
                const originalText = option.current.querySelector('span')?.textContent || option.current.textContent;
                option.current.innerHTML = originalText;
            }
        });
    };

    const handleHintTaken = () => {
        setHintTaken(true);
        setShowHint(true);
    };

    const handleSubmitQuiz = async () => {
        if (!lock) return;
        
        // Show score immediately without waiting for submission
        setShowScore(true);
        
        // Process backend submission in the background
        const submitInBackground = async () => {
            try {
                const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
                if (!userId) {
                    console.log('🔍 [QUIZ DEBUG] No user ID found, skipping submission');
                    return;
                }

                // Build the questions object: { [questionText]: true/false }
                const questionsStatus = {};
                questions.forEach((q, i) => {
                    // If answerArray[i] === 1, correct; else, incorrect
                    questionsStatus[q.question] = answerArray[i] === 1;
                });
                const subject = location.state?.subject || '';
                const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

                // Prepare the payload in the correct format
                const payload = {
                    username: username,
                    subject: mapSubjectForExamAPI(subject),
                    questions: questionsStatus,
                    difficultyLevel: Number(difficultyLevel) || 1
                };

                // Debug: Log the parameters and endpoint for submitting quiz
                console.log('🔍 [QUIZ DEBUG] Submitting quiz in background with parameters:', {
                    username,
                    subject: mapSubjectForExamAPI(subject),
                    questionsCount: Object.keys(questionsStatus).length,
                    difficultyLevel: Number(difficultyLevel) || 1,
                    rawSubject: subject
                });
                console.log('🔍 [QUIZ DEBUG] Questions status object:', questionsStatus);
                console.log('🔍 [QUIZ DEBUG] Submit endpoint:', `${EXAM_API_BASE_URL}${API_ENDPOINTS.SUBMIT_MCQ}`);
                console.log('🔍 [QUIZ DEBUG] Submit payload:', payload);

                const token = getFormattedToken();
                const res = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.SUBMIT_MCQ}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                console.log('🔍 [QUIZ DEBUG] Background submit response status:', res.status);

                if (res.ok) {
                    console.log('🔍 [QUIZ DEBUG] Quiz submitted successfully in background');
                } else {
                    console.error('🔍 [QUIZ DEBUG] Failed to submit MCQ results in background, status:', res.status);
                    const errorData = await res.text();
                    console.error('🔍 [QUIZ DEBUG] Background error response:', errorData);
                    
                    // Log error but don't show alert to user since they're already viewing score
                    if (res.status === 500) {
                        console.log('🔍 [QUIZ DEBUG] Temporary server issue, but quiz was completed');
                    } else {
                        console.log('🔍 [QUIZ DEBUG] Submission failed, but user experience is not affected');
                    }
                }
            } catch (error) {
                console.error('🔍 [QUIZ DEBUG] Error submitting MCQ in background:', error);
                // Don't show alert to user since they're already viewing score
            }
        };

        // Start background submission without blocking UI
        submitInBackground();
    };

    // Render conditions - only show loading for initial quiz loading, not for submission
    if (isLoading) {
        return <LoadingState isLoading={isLoading} isSubmitting={false} />;
    }

    if (error) {
        return <ErrorState error={error} navigate={navigate} onRetry={fetchQuestions} />;
    }

    if (!questions || questions.length === 0) {
        return <ErrorState error="Unable to load quiz questions. Please try again." navigate={navigate} onRetry={fetchQuestions} />;
    }

    if (!question) {
        return <LoadingState isLoading={true} isSubmitting={false} />;
    }

    return (
        <div className={`min-h-screen flex flex-col ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
        }`}>
            <Header navigate={navigate} />
            
            {showScore ? (
                <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
                    <div className={`w-full max-w-2xl mx-auto rounded-2xl shadow-xl border p-8 ${
                        isDarkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-100'
                    }`}>
                        <ScoreDisplay 
                            score={score} 
                            totalQuestions={questions.length} 
                            onReset={reset} 
                        />
                    </div>
                </main>
            ) : (
                <QuizContent
                    quizInfo={quizInfo}
                    question={question}
                    currentIndex={index}
                    totalQuestions={questions.length}
                    options={options}
                    lock={lock}
                    onCheckAnswer={checkAns}
                    onShowHint={handleHintTaken}
                    onShowExplanation={() => setShowExplanation(true)}
                    onHighlightAnswer={highlightAnswer}
                    onNext={handleNext}
                    onSubmitQuiz={handleSubmitQuiz}
                    showHint={showHint}
                    showExplanation={showExplanation}
                    isSubmitting={isSubmitting}
                    isCorrect={isCorrect}
                    hintTaken={hintTaken}
                />
            )}
        </div>
    );
};

export default QuizModular;
