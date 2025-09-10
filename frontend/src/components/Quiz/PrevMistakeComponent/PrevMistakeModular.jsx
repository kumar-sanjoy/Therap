import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../../../config';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

import '../../../css/PrevQuizDesign.css';

// Import sub-components
import Header from './Header';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import QuizContent from './QuizContent';
import ScoreDisplay from './ScoreDisplay';

const PrevMistakeModular = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useDarkTheme();

    // State management
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [question, setQuestion] = useState(null);
    const [lock, setLock] = useState(false);
    const [score, setScore] = useState(0);
    const [answerArray, setAnswerArray] = useState([]);
    const [showScore, setShowScore] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showAdvice, setShowAdvice] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isIncorrectAnswer, setIsIncorrectAnswer] = useState(false);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [quizInfo, setQuizInfo] = useState({
        class: location.state?.className || 'Class 9',
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
        
        // Check if user has the correct role for this page (PrevMistake is student-only)
        if (role !== 'STUDENT') {
            if (role === 'TEACHER') {
                navigate('/teacher');
            } else {
                navigate('/login');
            }
            return;
        }
    }, [navigate]);

    // Fetch questions on mount
    useEffect(() => {

        
        // Check if questions are passed from SelectSubject first
        if (location.state?.questions && location.state.questions.length > 0) {

            setQuestions(location.state.questions);
            return;
        }

        // Fallback: fetch questions if not passed from SelectSubject

        let isMounted = true; // Track if component is still mounted
        
        const fetchMistakes = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
                
                if (!token || !username) {
                    navigate('/login');
                    return;
                }

                const className = location.state?.className || 'Class 9';
                const subject = location.state?.subject || 'Science';
                const chapter = location.state?.chapter || '1';
                const count = location.state?.count || 5;

                const params = new URLSearchParams({
                    username,
                    className: mapClassForExamAPI(className),
                    subject: mapSubjectForExamAPI(subject),
                    chapter,
                    count: count.toString()
                });


                const response = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.PREVIOUS_MCQ}?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('🔍 [PREV_MISTAKE DEBUG] API response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('🔍 [PREV_MISTAKE DEBUG] API response data:', data);
                    if (isMounted) {
                        const extractedQuestions = data.mcqs || data.questions || data;
                        if (Array.isArray(extractedQuestions) && extractedQuestions.length > 0) {
                            setQuestions(extractedQuestions);
                        } else {
                            setError('No previous mistakes found for this subject. Please practice some questions first and then try again.');
                        }
                    }
                } else {
                    console.error('🔍 [PREV_MISTAKE DEBUG] API request failed:', response.status);
                    const errorText = await response.text();
                    console.error('🔍 [PREV_MISTAKE DEBUG] Error response:', errorText);
                    
                    if (isMounted) {
                        // Check if it's the "not enough questions practiced" error
                        if (errorText.includes('Not enough questions practiced')) {
                            setError('No previous mistakes found for this subject. Please practice some questions first and then try again.');
                        } else {
                            setError('Failed to fetch previous mistakes');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching mistakes:', error);
                if (isMounted) {
                    setError('Unable to connect to server');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMistakes();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [location.state, navigate]);

    // Update current question when index or questions change
    useEffect(() => {
        if (questions.length > 0) {
            setQuestion(questions[index]);
            setShowHint(false);
            setShowExplanation(false);
            setShowAdvice(false);
            setIsIncorrectAnswer(false);
        }
    }, [index, questions]);

    // Helper functions
    const highlightAnswer = () => {
        if (!question?.options) return;

        Object.entries(question.options).forEach(([key, _], i) => {
            const li = options[i]?.current;
            if (!li) return;

            if (key === question.answer) {
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

    const checkAnswer = (e, selectedKey) => {
        if (!lock && question?.options) {
            const isCorrect = selectedKey === question.answer;
            setAnswerArray(prev => [...prev.slice(0, index), isCorrect ? 1 : 0, ...prev.slice(index + 1)]);
            
            if (isCorrect) {
                e.target.classList.add("bg-green-100", "border-green-500", "text-green-800", "border-l-4");
                
                // Add accessibility indicators for correct answer
                const originalText = e.target.textContent;
                e.target.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span>${originalText}</span>
                        <div class="flex items-center ml-auto">
                            <FaCheck className="text-green-600 mr-1" />
                            <span class="text-xs font-semibold text-green-700">CORRECT</span>
                        </div>
                    </div>
                `;
                setScore(score => score + 1);
                setIsIncorrectAnswer(false);
            } else {
                e.target.classList.add("bg-red-100", "border-red-500", "text-red-800", "border-l-4");
                
                // Add accessibility indicators for wrong answer
                const originalText = e.target.textContent;
                e.target.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span>${originalText}</span>
                        <div class="flex items-center ml-auto">
                            <FaTimes className="text-red-600 mr-1" />
                            <span class="text-xs font-semibold text-red-700">INCORRECT</span>
                        </div>
                    </div>
                `;

                Object.entries(question.options).forEach(([key, _], i) => {
                    if (key === question.answer) {
                        const li = options[i]?.current;
                        if (li) {
                            li.classList.add("bg-green-100", "border-green-500", "text-green-800", "border-l-4");
                            
                            // Add accessibility indicators for correct answer
                            const correctOriginalText = li.textContent;
                            li.innerHTML = `
                                <div class="flex items-center justify-between">
                                    <span>${correctOriginalText}</span>
                                    <div class="flex items-center ml-auto">
                                        <FaCheck className="text-green-600 mr-1" />
                                        <span class="text-xs font-semibold text-green-700">CORRECT</span>
                                    </div>
                                </div>
                            `;
                        }
                    }
                });
                
                // Track incorrect question for advice
                setIncorrectQuestions(prev => [...prev, {
                    question: question.question,
                    advice: question.advice || "No specific advice available for this question.",
                    correctAnswer: question.options[question.answer],
                    questionNumber: index + 1
                }]);
                
                // Set incorrect answer state for advice
                setIsIncorrectAnswer(true);
            }
            setLock(true);
        }
    };

    const next = () => {
        if (lock) {
            if (index === questions.length - 1) {
                // Just show the score without submitting to backend
                setShowScore(true);
                return;
            }

            setShowHint(false);
            setShowExplanation(false);
            setShowAdvice(false);
            setIndex(prev => prev + 1);
            setLock(false);
            setIsIncorrectAnswer(false);

            options.forEach(option => {
                if (option.current) {
                    option.current.classList.remove("bg-green-100", "border-green-500", "text-green-800", "border-l-4", "bg-red-100", "border-red-500", "text-red-800", "border-l-4");
                    
                    // Reset the innerHTML to original text (remove accessibility indicators)
                    const originalText = option.current.querySelector('span')?.textContent || option.current.textContent;
                    option.current.innerHTML = originalText;
                }
            });
        }
    };

    const reset = () => {
        navigate('/main');
    };

    // Render conditions
    if (isLoading) {
        return <LoadingState isLoading={isLoading} />;
    }

    if (error) {
        return <ErrorState error={error} navigate={navigate} />;
    }

    if (!question || questions.length === 0) {
        return (
            <div className={`min-h-screen flex flex-col ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
            }`}>
                <Header navigate={navigate} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📚</span>
                        </div>
                        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            No Questions Available
                        </h2>
                        <p className={`text-gray-600 dark:text-gray-400 mb-4`}>
                            No previous mistakes found for this subject. Please practice some questions first and then try again.
                        </p>
                        <button
                            onClick={() => navigate('/main')}
                            className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors`}
                        >
                            Go Back to Main
                        </button>
                    </div>
                </div>
            </div>
        );
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
                            incorrectQuestions={incorrectQuestions}
                            onReset={reset} 
                        />
                    </div>
                </main>
            ) : (
                <>
                    <QuizContent
                        question={question}
                        currentIndex={index}
                        totalQuestions={questions.length}
                        options={options}
                        lock={lock}
                        onCheckAnswer={checkAnswer}
                        onShowHint={() => setShowHint(true)}
                        onShowExplanation={() => setShowExplanation(true)}
                        onShowAdvice={() => setShowAdvice(true)}
                        onHighlightAnswer={highlightAnswer}
                        onNext={next}
                        showHint={showHint}
                        showExplanation={showExplanation}
                        showAdvice={showAdvice}
                        quizInfo={quizInfo}
                        isIncorrectAnswer={isIncorrectAnswer}
                    />
                </>
            )}
            

        </div>
    );
};

export default PrevMistakeModular;
