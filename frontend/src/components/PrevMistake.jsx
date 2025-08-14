import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaLightbulb, FaCheckCircle, FaTimesCircle, FaTools } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';
import { API_BASE_URL, EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, DEV_MODE, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import flowLogo from '../assets/flow-dark.png';
import '../css/PrevQuizDesign.css';

const Prev = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    let hasFetched = false;

    const Option1 = useRef(null);
    const Option2 = useRef(null);
    const Option3 = useRef(null);
    const Option4 = useRef(null);
    const options = [Option1, Option2, Option3, Option4];


    useEffect(() => {
        if (DEV_MODE) {
            setTimeout(() => {
                setQuestions([
                    {
                        question: "Which gas do plants absorb from the atmosphere?",
                        options: { a: "Oxygen", b: "Carbon Dioxide", c: "Nitrogen", d: "Hydrogen" },
                        answer: "b",
                        hint: "It's essential for photosynthesis.",
                        explanation: "Plants absorb carbon dioxide for photosynthesis.",
                        advice: "Remember: Photosynthesis uses CO2 and releases O2!"
                    },
                    {
                        question: "What is the boiling point of water?",
                        options: { a: "90°C", b: "80°C", c: "100°C", d: "120°C" },
                        answer: "c",
                        hint: "It's a round number.",
                        explanation: "Water boils at 100°C at standard atmospheric pressure.",
                        advice: "Standard boiling point is 100°C."
                    }
                ]);
                setIsLoading(false);
            }, 800);
            return;
        }

        // Check if questions are passed from SelectSubject
        if (location.state?.questions && location.state.questions.length > 0) {
            setQuestions(location.state.questions);
            setIsLoading(false);
            return;
        }

        // Fallback: fetch questions if not passed from SelectSubject
        const fetchMistakes = async () => {
            try {
                const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
                if (!userId) {
                    navigate('/login');
                    return;
                }

                // Get params from location.state or fallback to defaults
                const className = location.state?.className || location.state?.class || 'Class 9';
                const subject = location.state?.subject || 'Science';
                const chapter = location.state?.chapter || 'Chapter 1';
                const count = location.state?.count || 3;
                const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'default_user';
                const params = new URLSearchParams({
                    username,
                    className: mapClassForExamAPI(className),
                    subject: mapSubjectForExamAPI(subject),
                    chapter,
                    count: count.toString()
                });
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                const res = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.PREVIOUS_MCQ}?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data.mcqs || data.questions || data.mistakes || []);
                } else if (res.status === 400) {
                    setError('Not enough questions practised for this subject. Please practice more questions first.');
                    setQuestions([]);
                } else {
                    console.error('Failed to fetch mistakes');
                    setError('Failed to load previous mistakes. Please try again.');
                    setQuestions([]);
                }
            } catch (error) {
                console.error('Error fetching mistakes:', error);
            }
        };

        fetchMistakes();
    }, [navigate, location.state]);

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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin"></div>
                    <p className="mt-6 text-[#343434] text-lg font-semibold">Loading Previous Mistakes...</p>
                </div>
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
                <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="text-center">
                        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Previous Mistakes</h2>
                        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
                        <button 
                            className="px-6 py-3 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md"
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
            {/* Header */}
            <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b border-gray-100 shrink-0 bg-gradient-to-r from-white to-gray-50/50">
                <img src={flowLogo} alt="FLOW Logo" className="h-10 rounded-xl" />
                <button 
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-[#343434] hover:text-white transition-all flex items-center gap-2"
                    onClick={() => navigate('/main')}
                    aria-label="Go back to main page"
                >
                    <IoMdArrowRoundBack />
                    Back
                </button>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
                <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-0 md:p-0 mt-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-8 py-6 flex items-center gap-4 border-b border-gray-100">
                        <span className="text-3xl text-[#343434]"><GrNotes /></span>
                        <h2 className="text-xl md:text-2xl font-bold text-[#343434] tracking-tight">Previous Mistakes</h2>
                    </div>
                    <div className="p-8">
                        {showScore ? (
                            <div className="flex flex-col items-center justify-center gap-6">
                                <FaCheckCircle className="text-green-500 text-5xl mb-2" />
                                <h2 className="text-2xl font-bold text-[#343434]">You scored {score} out of {questions.length}</h2>
                                <button className="px-6 py-3 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md" onClick={reset}>Go Back</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div className="flex gap-2">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-yellow-100 text-[#343434] rounded-lg font-medium border border-gray-200 transition-all" onClick={() => setShowHint(true)}>
                                            <FaLightbulb className="text-yellow-400" /> Hint
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-100 text-[#343434] rounded-lg font-medium border border-gray-200 transition-all" onClick={() => {
                                            highlightAnswer();
                                            setShowExplanation(true);
                                            setLock(true);
                                        }}>
                                            <GrNotes className="text-blue-400" /> Explanation
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-green-100 text-[#343434] rounded-lg font-medium border border-gray-200 transition-all" onClick={() => setShowAdvice(true)}>
                                            <FaTools className="text-green-400" /> Advice
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">{index + 1} of {questions.length}</div>
                                </div>

                                <h2 className="text-xl font-semibold text-[#343434] mb-6">{index + 1}. {question.question}</h2>
                                <ul className="space-y-4 mb-6">
                                    {question?.options && Object.entries(question.options).map(([key, value], i) => (
                                        <li
                                            key={key}
                                            ref={options[i]}
                                            onClick={(e) => checkAnswer(e, key)}
                                            className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-lg text-[#343434] cursor-pointer transition-all hover:bg-gray-100 select-none"
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
                                    className="px-6 py-3 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
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