import React, { useRef, useEffect, useState } from 'react';
import '../css/QuizDesign.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkTheme } from './DarkThemeProvider';
import flowLogoLight from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import { API_BASE_URL, EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, DEV_MODE, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import { LuNotebookPen } from "react-icons/lu";
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaLightbulb, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useDarkTheme();

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

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);
  const options = [Option1, Option2, Option3, Option4];

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

    if (!token || !username) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch questions on mount
  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      // Check authentication before fetching
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

      if (!token || !username) {
        navigate('/login');
        return;
      }

      if (DEV_MODE) {
        // Use mock questions
        let initialQuestions = location.state?.questions || [];
        if (!initialQuestions || initialQuestions.length === 0) {
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
        if (isMounted) setQuestions(initialQuestions);
      } else {
        // Fetch from API
        setIsLoading(true);
        try {
          // Get params from location.state
          const className = location.state?.className || location.state?.class || '';
          const subject = location.state?.subject || '';
          const chapter = location.state?.chapter || '';
          const count = location.state?.count || 3;

          // Get username from localStorage (already verified above)
          const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

          const params = new URLSearchParams({
            username,
            className: mapClassForExamAPI(className),
            subject: mapSubjectForExamAPI(subject),
            chapter,
            count: count.toString()
          });
          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          const res = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.MCQ}?${params.toString()}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!res.ok) throw new Error('Failed to fetch questions');
          const data = await res.json();
          // Expecting data to be { mcqs: [...], difficultyLevel: number }
          if (isMounted) {
            setQuestions(data.mcqs || []);
            setDifficultyLevel(data.difficultyLevel || null);
          }
        } catch (err) {
          console.error(err);
          if (isMounted) setQuestions([]);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };
    fetchQuestions();
    return () => { isMounted = false; };
  }, [location.state]);

  useEffect(() => {
    if (questions.length > 0) {
      setQuestion(questions[index]);
    }
  }, [index, questions]);

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
        try {
          const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
          if (!userId) {
            navigate('/login');
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

          console.log('Submitting MCQ with data:', {
            username: username,
            subject: mapSubjectForExamAPI(subject),
            questions: questionsStatus,
            difficultyLevel: difficultyLevel || 1
          });

          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          const res = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.SUBMIT_MCQ}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              subject: mapSubjectForExamAPI(subject),
              questions: questionsStatus,
              difficultyLevel: difficultyLevel || 1
            }),
          });

          if (res.ok) {
            console.log('Quiz submitted successfully');
            setShowScore(true);
            setIsLoading(false);
          } else {
            console.error('Failed to submit MCQ results');
            const errorData = await res.text();
            console.error('Error response:', errorData);
            // Show error message to user
            alert('Failed to submit quiz results. Please try again.');
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error submitting MCQ:', error);
        } finally {
          setIsLoading(false);
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
    navigate('/main');
  };

  // Show loading screen when fetching questions
  if (isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="relative flex flex-col items-center justify-center">
            {/* Main loading icon with smooth animation */}
            <div className="relative mb-6 animate-pulse">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <GrNotes className="text-4xl text-purple-600" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full opacity-20 bg-purple-400 blur-md"></div>
            </div>

            {/* Animated dots with staggered animation */}
            <div className="flex justify-center space-x-2 mb-8">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2.5 h-2.5 rounded-full bg-purple-500"
                  style={{
                    animation: 'bounce 1.5s infinite ease-in-out',
                    animationDelay: `${delay}ms`
                  }}
                ></div>
              ))}
            </div>

            {/* Loading message with smooth fade */}
            <div className="text-center mb-8 animate-fadeIn">
              <p className="text-xl font-semibold mb-2 text-purple-600">
                Loading Quiz Questions
              </p>
              <p className="text-gray-500">Just a moment while we prepare your quiz</p>
            </div>

            {/* Animated progress bar with gradient */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                style={{
                  animation: 'progress 2.5s ease-in-out infinite',
                  width: '0%'
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">Loading your quiz questions</p>

            {/* Floating particles with different animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-purple-300/40"
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


        </div>
      </div>
    );
  }

  // Show loading overlay when submitting
  if (isLoading && questions.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="relative flex flex-col items-center justify-center">
            {/* Main loading icon with smooth animation */}
            <div className="relative mb-6 animate-pulse">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-4xl text-green-600" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full opacity-20 bg-green-400 blur-md"></div>
            </div>

            {/* Animated dots with staggered animation */}
            <div className="flex justify-center space-x-2 mb-8">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2.5 h-2.5 rounded-full bg-green-500"
                  style={{
                    animation: 'bounce 1.5s infinite ease-in-out',
                    animationDelay: `${delay}ms`
                  }}
                ></div>
              ))}
            </div>

            {/* Loading message with smooth fade */}
            <div className="text-center mb-8 animate-fadeIn">
              <p className="text-xl font-semibold mb-2 text-green-600">
                Submitting Quiz Results
              </p>
              <p className="text-gray-500">Just a moment while we save your answers</p>
            </div>

            {/* Animated progress bar with gradient */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                style={{
                  animation: 'progress 2.5s ease-in-out infinite',
                  width: '0%'
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">Processing your quiz submission</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have questions and current question
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="text-center">
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-6">Unable to load quiz questions. Please try again.</p>
            <button
              className="px-6 py-3 bg-[#343434] hover:bg-gray-800 text-white font-medium rounded-lg transition-all hover:shadow-md"
              onClick={() => navigate('/select')}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
        }`}>
        <div className={`fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
          }`}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
      }`}>
      {/* Header */}
      <header className={`w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${isDarkMode
          ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900/50'
          : 'border-gray-100 bg-gradient-to-r from-white to-gray-50/50'
        }`}>
        <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="h-10 rounded-xl" />
        <button
          className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${isDarkMode
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
        <div className={`w-full max-w-2xl mx-auto rounded-2xl shadow-xl border p-0 md:p-0 mt-8 overflow-hidden ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-100'
          }`}>
          <div className={`px-8 py-6 flex items-center gap-4 border-b ${isDarkMode
              ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600'
              : 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-100'
            }`}>
            <span className={`text-3xl ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}><GrNotes /></span>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'
              }`}>Quiz</h2>
          </div>
          <div className="p-8">
            {showScore ? (
              <div className="flex flex-col items-center justify-center gap-6">
                <FaCheckCircle className="text-green-500 text-5xl mb-2" />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>You scored {score} out of {questions.length}</h2>
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
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{index + 1} of {questions.length}</div>
                </div>
                <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>{index + 1}. {question.question}</h2>
                <ul className="space-y-4 mb-6">
                  {Object.entries(question.options).map(([key, value], i) => (
                    <li
                      key={key}
                      ref={options[i]}
                      onClick={(e) => checkAnswer(e, key)}
                      className={`qz-option border rounded-lg px-6 py-4 text-lg cursor-pointer transition-all select-none ${isDarkMode
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