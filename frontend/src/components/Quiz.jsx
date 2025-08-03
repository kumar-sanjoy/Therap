import React, { useRef, useEffect, useState } from 'react';
import '../css/QuizDesign.css';
import { useLocation, useNavigate } from 'react-router-dom';
import flowLogo from '../assets/flow-main-nobg.png';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, DEV_MODE } from '../config';
import { LuNotebookPen } from "react-icons/lu";
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaLightbulb, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';

// Define the maps outside the component or import them if they are in config.js
// For this example, I'm placing them directly here.
const class_map = { 'a': '910', 'b': '8', 'c': '7', 'd': '6' };
const subject_map = { 'a': 'P', 'b': 'C', 'c': 'B' };

const Quiz = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const Option1 = useRef(null);
    const Option2 = useRef(null);
    const Option3 = useRef(null);
    const Option4 = useRef(null);
    const options = [Option1, Option2, Option3, Option4];

    // Fetch questions on mount
    useEffect(() => {
        let isMounted = true;
        const fetchQuestions = async () => {
            setIsLoading(true);
            setError(null); // Clear previous errors
            try {
                // Get raw values from location state
                const rawClassName = location.state?.className || location.state?.class || '';
                const rawSubject = location.state?.subject || '';
                const chapter = location.state?.chapter || '';
                const count = location.state?.count || 3;
                const username = localStorage.getItem(STORAGE_KEYS.USER_ID);

                if (!username) {
                    setError('User ID not found. Please log in.');
                    navigate('/login');
                    return;
                }

                // **Apply the mappings**
                const mappedClassName = class_map[rawClassName] || rawClassName; // Use mapped value or fallback to raw
                const mappedSubject = subject_map[rawSubject] || rawSubject;     // Use mapped value or fallback to raw


                // Construct URLSearchParams for query parameters using mapped values
                const params = new URLSearchParams({
                    username: username,
                    className: 'a', // Use the mapped class name
                    subject: 'a',     // Use the mapped subject
                    chapter: '3',
                    count: count.toString()
                }).toString();

                const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.MCQ}?${params}`;

                const res = await fetch(fullUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYW5qb3kiLCJpYXQiOjE3NTQxOTYxNzMsImV4cCI6MTc1NDI4MjU3M30.uYIEzW6mdH7t28NHHZVaMo6qXgBfrZWmWr1Y9nJ1Zm6yOPMANm_ukMz8sd2flaVIvcEo8jxVSqWKqTnUP6zW9Q`},
                    body: JSON.stringify({}) // Explicitly empty JSON body
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch questions');
                }
                const data = await res.json();
                if (isMounted) {
                    if (data.mcqs && data.mcqs.length > 0) {
                        setQuestions(data.mcqs);
                    } else {
                        setError('No questions found for the selected criteria.');
                        setQuestions([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
                if (isMounted) {
                    setError(err.message || 'An unexpected error occurred while fetching questions.');
                    setQuestions([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchQuestions();
        return () => { isMounted = false; };
    }, [location.state, navigate]); // Added navigate to dependencies as it's used inside useEffect

    useEffect(() => {
        if (questions.length > 0) {
            setQuestion(questions[index]);
        } else if (!isLoading && !error) {
            setQuestion(null);
        }
    }, [index, questions, isLoading, error]);

    const highlightAnswer = () => {
        if (!question) return;
        Object.entries(question.options).forEach(([key, value], i) => {
            const li = options[i].current;
            if (li) {
                if (key === question.answer) {
                    li.classList.add("bg-green-100", "border-green-500", "text-green-800");
                } else {
                    li.classList.add("bg-red-100", "border-red-500", "text-red-800");
                }
            }
        });
    };

    const checkAnswer = (e, selectedKey) => {
        if (!lock && question) {
            const isCorrect = selectedKey === question.answer;
            setAnswerArray(prev => [...prev.slice(0, index), isCorrect ? 1 : 0, ...prev.slice(index + 1)]);
            if (isCorrect) {
                e.target.classList.add("bg-green-100", "border-green-500", "text-green-800");
                setScore(score => score + 1);
            } else {
                e.target.classList.add("bg-red-100", "border-red-500", "text-red-800");
                setMissedQuestions(prev => [...prev, question.question]);
                Object.entries(question.options).forEach(([key, _], i) => {
                    const li = options[i].current;
                    if (li && key === question.answer) {
                        li.classList.add("bg-green-100", "border-green-500", "text-green-800");
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

                const questionsStatus = {};
                questions.forEach((q, i) => {
                    questionsStatus[q.question] = answerArray[i] === 1;
                });
                const subject = location.state?.subject || '';

                try {
                    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUBMIT_MCQ}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN) || ''}`
                        },
                        body: JSON.stringify({
                            userId: parseInt(userId),
                            questions: questionsStatus,
                            subject
                        }),
                    });

                    if (res.ok) {
                        setShowScore(true);
                    } else {
                        const errorData = await res.json();
                        setError(errorData.message || 'Failed to submit quiz results.');
                        console.error('Failed to submit MCQ results:', errorData);
                    }
                } catch (err) {
                    setError(err.message || 'An unexpected error occurred during submission.');
                    console.error("Error submitting quiz:", err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setShowHint(false);
                setShowExplanation(false);
                setIndex((prev) => prev + 1);
                setLock(false);

                options.forEach((option) => {
                    if (option.current) {
                        option.current.classList.remove("bg-green-100", "border-green-500", "text-green-800", "bg-red-100", "border-red-500", "text-red-800");
                    }
                });
            }
        }
    };

    const reset = () => {
        navigate('/select');
    };

    // Render error message or "No Questions Available" if applicable
    if (error || (questions.length === 0 && !isLoading)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-[#343434] mb-4">
                        {error ? "Error Loading Quiz" : "No Questions Available"}
                    </h2>
                    <p className="text-red-600 mb-6">
                        {error ? error : "We couldn't find any questions matching your criteria."}
                    </p>
                    <button
                        className="px-6 py-3 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md"
                        onClick={reset}
                    >
                        Go Back to Selection
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || !question) return <div className="qz-quiz-body">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin"></div>
                    <p className="mt-6 text-[#343434] text-lg font-semibold">
                        {index === questions.length - 1 && lock ? "Submitting Quiz..." : "Loading Quiz..."}
                    </p>
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
                                {missedQuestions.length > 0 && (
                                    <div className="text-left w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2"><FaTimesCircle /> Missed Questions:</h3>
                                        <ul className="list-disc list-inside text-red-700">
                                            {missedQuestions.map((q, i) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
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
                                {showHint && question.hint && <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-4"><FaLightbulb className="text-yellow-400" /> <span className="font-medium">Hint:</span> {question.hint}</div>}
                                {showExplanation && question.explanation && (
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