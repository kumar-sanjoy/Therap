import React, { useRef, useEffect, useState } from 'react';
import '../css/QuizDesign.css';
import { useLocation, useNavigate } from 'react-router-dom';
import flowLogo from '../assets/flow-main-nobg.png';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, DEV_MODE } from '../config';
import { LuNotebookPen } from "react-icons/lu";
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaLightbulb, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';

const Quiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    let initialQuestions = location.state?.questions || [];

    // DEV_MODE: Provide mock questions if not present
    if (DEV_MODE && (!initialQuestions || initialQuestions.length === 0)) {
        initialQuestions = [
            {
                question: "What is the capital of France?",
                options: { a: "London", b: "Berlin", c: "Paris", d: "Madrid" },
                answer: "c",
                hint: "Think about the Eiffel Tower",
                explanation: "Paris is the capital city of France"
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: { a: "Venus", b: "Mars", c: "Jupiter", d: "Saturn" },
                answer: "b",
                hint: "It's named after the Roman god of war",
                explanation: "Mars is called the Red Planet due to its reddish appearance"
            },
            {
                question: "What is 2 + 2?",
                options: { a: "3", b: "4", c: "5", d: "6" },
                answer: "b",
                hint: "Basic arithmetic",
                explanation: "2 + 2 = 4"
            }
        ];
    }

    const [questions, setQuestions] = useState(initialQuestions);
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

    const Option1 = useRef(null);
    const Option2 = useRef(null);
    const Option3 = useRef(null);
    const Option4 = useRef(null);
    const options = [Option1, Option2, Option3, Option4];

    useEffect(() => {
        if (questions.length > 0) {
            setQuestion(questions[index]);
        }
    }, [index, questions.length]);

    const highlightAnswer = () => {
        Object.entries(question.options).forEach(([key, value], i) => {
            const li = options[i].current;
            if (key === question.answer) {
                li.classList.add("bg-green-100", "border-green-500", "text-green-800");
            } else {
                li.classList.add("bg-red-100", "border-red-500", "text-red-800");
            }
        });
    };

    const checkAnswer = (e, selectedKey) => {
        if (!lock) {
            const isCorrect = selectedKey === question.answer;
            setAnswerArray(prev => [...prev.slice(0, index), isCorrect ? 1 : 0, ...prev.slice(index + 1)]);
            if (isCorrect) {
                e.target.classList.add("bg-green-100", "border-green-500", "text-green-800");
                setScore(score => score + 1);
            } else {
                e.target.classList.add("bg-red-100", "border-red-500", "text-red-800");
                setMissedQuestions(prev => [...prev, question.question]);
                Object.entries(question.options).forEach(([key, _], i) => {
                    if (key === question.answer) {
                        options[i].current.classList.add("bg-green-100", "border-green-500", "text-green-800");
                    }
                });
            }
            setLock(true);
        }
    };

    const next = async () => {
        if (lock) {
            if (index === questions.length - 1) {
                setIsLoading(true);
                const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
                if (!userId) {
                    navigate('/login');
                    return;
                }

                const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NEW_MISTAKES}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        mistakes: missedQuestions.map((question, index) => ({
                            question: question,
                            userAnswer: answerArray[index] === 1 ? question : null,
                            correctAnswer: questions[index].answer,
                            explanation: questions[index].explanation
                        }))
                    }),
                });

                if (res.ok) {
                    setShowResults(true);
                } else {
                    console.error('Failed to submit mistakes');
                }
            } else {
                setShowHint(false);
                setShowExplanation(false);
                setIndex((prev) => prev + 1);
                setLock(false);

                options.forEach((option) => {
                    option.current.classList.remove("bg-green-100", "border-green-500", "text-green-800", "bg-red-100", "border-red-500", "text-red-800");
                });
            }
        }
    };

    const reset = () => {
        navigate('/select');
    };

    if (!question) return <div className="qz-quiz-body">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin"></div>
                    <p className="mt-6 text-[#343434] text-lg font-semibold">Submitting Quiz...</p>
                </div>
            )}
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
                        <h2 className="text-xl md:text-2xl font-bold text-[#343434] tracking-tight">Quiz</h2>
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
                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-100 text-[#343434] rounded-lg font-medium border border-gray-200 transition-all" onClick={() => { highlightAnswer(); setShowExplanation(true); setLock(true); }}>
                                            <GrNotes className="text-blue-400" /> Explanation
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">{index + 1} of {questions.length}</div>
                                </div>
                                <h2 className="text-xl font-semibold text-[#343434] mb-6">{index + 1}. {question.question}</h2>
                                <ul className="space-y-4 mb-6">
                                    {Object.entries(question.options).map(([key, value], i) => (
                                        <li
                                            key={key}
                                            ref={options[i]}
                                            onClick={(e) => checkAnswer(e, key)}
                                            className="qz-option bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-lg text-[#343434] cursor-pointer transition-all hover:bg-gray-100 select-none"
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
                                <button className="px-6 py-3 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" onClick={next} disabled={!lock}>Next</button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Quiz;