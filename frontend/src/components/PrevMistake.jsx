import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaLightbulb, FaCheckCircle, FaTimesCircle, FaTools } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';
import { API_BASE_URL, EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import { useDarkTheme } from './DarkThemeProvider';
import flowLogoLight from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import '../css/PrevQuizDesign.css';

const Prev = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useDarkTheme();

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

    useEffect(() => {
        console.log('🔍 [PREV_MISTAKE DEBUG] Component mounted with location state:', location.state);
        
        // Check if questions are passed from SelectSubject first
        if (location.state?.questions && location.state.questions.length > 0) {
            console.log('🔍 [PREV_MISTAKE DEBUG] Questions received from SelectSubject:', location.state.questions);
            setQuestions(location.state.questions);
            return;
        }

        // Fallback: fetch questions if not passed from SelectSubject
        console.log('🔍 [PREV_MISTAKE DEBUG] No questions from SelectSubject, fetching from API');
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

                console.log('🔍 [PREV_MISTAKE DEBUG] Fetching from API with params:', params.toString());
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
                    setQuestions(data.mcqs || data.questions || []);
                } else {
                    console.error('🔍 [PREV_MISTAKE DEBUG] API request failed:', response.status);
                    const errorText = await response.text();
                    console.error('🔍 [PREV_MISTAKE DEBUG] Error response:', errorText);
                    
                    // Check if it's the "not enough questions practiced" error
                    if (errorText.includes('Not enough questions practiced')) {
                        setError('No previous mistakes found for this subject. Please practice some questions first and then try again.');
                    } else {
                        setError('Failed to fetch previous mistakes');
                    }
                }
            } catch (error) {
                console.error('Error fetching mistakes:', error);
                setError('Unable to connect to server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMistakes();
    }, [location.state, navigate]);

    useEffect(() => {
        if (questions.length > 0) {
            setQuestion(questions[index]);
            setShowHint(false);
            setShowExplanation(false);
            setShowAdvice(false);
        }
    }, [index, questions]);

    const highlightAnswer = () => {
        if (!question?.options) return;

        Object.entries(question.options).forEach(([key, _], i) => {
            const li = options[i]?.current;
            if (!li) return;

            if (key === question.answer) {
                li.classList.add("bg-green-100", "border-green-500", "text-green-800");
            } else {
                li.classList.add("bg-red-100", "border-red-500", "text-red-800");
            }
        });
    };

    const checkAnswer = (e, selectedKey) => {
        if (!lock && question?.options) {
            const isCorrect = selectedKey === question.answer;
            setAnswerArray(prev => [...prev.slice(0, index), isCorrect ? 1 : 0, ...prev.slice(index + 1)]);
            
            if (isCorrect) {
                e.target.classList.add("bg-green-100", "border-green-500", "text-green-800");
                setScore(score => score + 1);
            } else {
                e.target.classList.add("bg-red-100", "border-red-500", "text-red-800");

                Object.entries(question.options).forEach(([key, _], i) => {
                    if (key === question.answer) {
                        const li = options[i]?.current;
                        if (li) li.classList.add("bg-green-100", "border-green-500", "text-green-800");
                    }
                });
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

            options.forEach(option => {
                option.current.classList.remove("bg-green-100", "border-green-500", "text-green-800", "bg-red-100", "border-red-500", "text-red-800");
            });
        }
    };

    const reset = () => {
        navigate('/main');
    };

    // Loading screen with rolling animation
    if (isLoading) {
        return (
            <div className={`min-h-screen flex flex-col ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
            }`}>
                <div className={`fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${
                    isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'
                }`}>
                    <div className={`w-16 h-16 border-4 rounded-full animate-spin ${
                        isDarkMode 
                            ? 'border-gray-600 border-t-gray-300' 
                            : 'border-gray-200 border-t-[#343434]'
                    }`}></div>
                    <p className={`mt-6 text-lg font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-[#343434]'
                    }`}>Loading Previous Mistakes...</p>
                </div>
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div className={`min-h-screen flex flex-col ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
            }`}>
                <div className={`fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${
                    isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
                }`}>
                    <div className="text-center">
                        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                        <h2 className={`text-2xl font-bold mb-2 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>No Previous Mistakes</h2>
                        <p className={`mb-6 max-w-md ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{error}</p>
                        <button 
                            className={`px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md ${
                                isDarkMode 
                                    ? 'bg-white hover:bg-gray-100 text-gray-900' 
                                    : 'bg-[#343434] hover:bg-gray-800 text-white'
                            }`}
                            onClick={() => navigate('/main')}
                        >
                            Go Back to Main
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!question) return null;

    return (
        <div className={`min-h-screen flex flex-col ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
        }`}>
            {/* Header */}
            <header className={`w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${
                isDarkMode 
                    ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900/50' 
                    : 'border-gray-100 bg-gradient-to-r from-white to-gray-50/50'
            }`}>
                <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="h-10 rounded-xl" />
                <button 
                    className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
                        isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-[#343434] hover:text-white'
                    }`}
                    onClick={() => navigate('/main')}
                    aria-label="Go back to main page"
                >
                    <IoMdArrowRoundBack />
                    Back
                </button>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
                <div className={`w-full max-w-2xl mx-auto rounded-2xl shadow-xl border p-0 md:p-0 mt-8 overflow-hidden ${
                    isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-100'
                }`}>
                    <div className={`px-8 py-6 flex items-center gap-4 border-b ${
                        isDarkMode 
                            ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-100'
                    }`}>
                        <span className={`text-3xl ${
                            isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                        }`}><GrNotes /></span>
                        <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${
                            isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                        }`}>Previous Mistakes</h2>
                    </div>
                    <div className="p-8">
                        {showScore ? (
                            <div className="flex flex-col items-center justify-center gap-6">
                                <FaCheckCircle className="text-green-500 text-5xl mb-2" />
                                <h2 className={`text-2xl font-bold ${
                                    isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                                }`}>You scored {score} out of {questions.length}</h2>
                                <button className={`px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md ${
                                    isDarkMode 
                                        ? 'bg-white hover:bg-gray-100 text-gray-900' 
                                        : 'bg-[#343434] hover:bg-gray-800 text-white'
                                }`} onClick={reset}>Go Back</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div className="flex gap-2">
                                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all ${
                                            isDarkMode 
                                                ? 'bg-gray-700 hover:bg-yellow-900/20 text-gray-200 border-gray-600' 
                                                : 'bg-gray-100 hover:bg-yellow-100 text-[#343434] border-gray-200'
                                        }`} onClick={() => setShowHint(true)}>
                                            <FaLightbulb className="text-yellow-400" /> Hint
                                        </button>
                                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all ${
                                            isDarkMode 
                                                ? 'bg-gray-700 hover:bg-blue-900/20 text-gray-200 border-gray-600' 
                                                : 'bg-gray-100 hover:bg-blue-100 text-[#343434] border-gray-200'
                                        }`} onClick={() => {
                                            highlightAnswer();
                                            setShowExplanation(true);
                                            setLock(true);
                                        }}>
                                            <GrNotes className="text-blue-400" /> Explanation
                                        </button>
                                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all ${
                                            isDarkMode 
                                                ? 'bg-gray-700 hover:bg-green-900/20 text-gray-200 border-gray-600' 
                                                : 'bg-gray-100 hover:bg-green-100 text-[#343434] border-gray-200'
                                        }`} onClick={() => setShowAdvice(true)}>
                                            <FaTools className="text-green-400" /> Advice
                                        </button>
                                    </div>
                                    <div className={`text-sm font-medium ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>{index + 1} of {questions.length}</div>
                                </div>

                                <h2 className={`text-xl font-semibold mb-6 ${
                                    isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                                }`}>{index + 1}. {question.question}</h2>
                                <ul className="space-y-4 mb-6">
                                    {question?.options && Object.entries(question.options).map(([key, value], i) => (
                                        <li
                                            key={key}
                                            ref={options[i]}
                                            onClick={(e) => checkAnswer(e, key)}
                                            className={`border rounded-lg px-6 py-4 text-lg cursor-pointer transition-all select-none ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                                                    : 'bg-gray-50 border-gray-200 text-[#343434] hover:bg-gray-100'
                                            }`}
                                        >
                                            {value}
                                        </li>
                                    ))}
                                </ul>

                                {showHint && <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-4"><FaLightbulb className="text-yellow-400" /> <span className="font-medium">Hint:</span> {question.hint}</div>}
                                {showExplanation && (
                                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg px-4 py-3 mb-4">
                                        <GrNotes className="text-blue-400 text-2xl mt-1" />
                                        <div>
                                            <div className="mb-1"><span className="font-semibold">Correct Answer:</span> <strong>{question.options[question.answer]}</strong></div>
                                            <div><span className="font-semibold">Explanation:</span> {question.explanation}</div>
                                        </div>
                                    </div>
                                )}
                                {showAdvice && (
                                    <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-900 rounded-lg px-4 py-3 mb-4">
                                        <FaTools className="text-green-400 text-2xl mt-1" />
                                        <div>
                                            <div><span className="font-semibold">Advice:</span> {question.advice || "No advice available."}</div>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    className={`px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isDarkMode 
                                            ? 'bg-white hover:bg-gray-100 text-gray-900' 
                                            : 'bg-[#343434] hover:bg-gray-800 text-white'
                                    }`} 
                                    onClick={next} 
                                    disabled={!lock}
                                >
                                    {index === questions.length - 1 ? 'Finish' : 'Next'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Prev;