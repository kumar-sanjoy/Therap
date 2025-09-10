import React, { useState, useEffect, useRef } from 'react';
import { FaLightbulb, FaTools } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import teacherImage from '../../../assets/teacher.jpg';
import TypewriterEffect from '../../Common/TypewriterEffect';
import { teacherMessages, getRandomMessage } from '../../Common/TeacherMessages';

const QuestionDisplay = ({ 
    question, 
    currentIndex, 
    options, 
    onCheckAnswer, 
    showHint, 
    showExplanation, 
    showAdvice,
    isQuestionAnswered,
    isCorrect,
    onShowHint,
    onShowExplanation,
    onShowAdvice
}) => {
    const { isDarkMode } = useDarkTheme();
    
    // State for message display
    const [currentMessage, setCurrentMessage] = useState('');
    const [showTypewriter, setShowTypewriter] = useState(false);
    const [timer, setTimer] = useState(null);
    const messageTimeoutRef = useRef(null);
    const currentQuestionRef = useRef(currentIndex);

    // Function to update message with typewriter effect
    const updateMessage = (newMessage) => {
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
        
        setShowTypewriter(false);
        messageTimeoutRef.current = setTimeout(() => {
            if (currentQuestionRef.current === currentIndex) {
                setCurrentMessage(newMessage);
                setShowTypewriter(true);
            }
        }, 100);
    };

    // Function to clear all timeouts
    const clearAllTimeouts = () => {
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
            messageTimeoutRef.current = null;
        }
    };

    // Set up timer and learning tip when question changes
    useEffect(() => {
        currentQuestionRef.current = currentIndex;
        clearAllTimeouts();
        
        // Set a random learning tip for previous mistakes
        const randomTip = getRandomMessage(teacherMessages.prevMistake);
        setCurrentMessage(randomTip);
        setShowTypewriter(true);

        // Set timer for 17 seconds to show hint prompt
        if (!isQuestionAnswered) {
            const newTimer = setTimeout(() => {
                if (currentQuestionRef.current === currentIndex && !isQuestionAnswered) {
                    const hintPrompt = getRandomMessage(teacherMessages.askingForHint);
                    updateMessage(hintPrompt);
                }
            }, 17000);
            
            setTimer(newTimer);
        }

        return () => {
            clearAllTimeouts();
        };
    }, [currentIndex, isQuestionAnswered]);

    // Handle hint usage
    useEffect(() => {
        if (showHint && currentQuestionRef.current === currentIndex) {
            const hintMessage = getRandomMessage(teacherMessages.hintUsed);
            updateMessage(hintMessage);
        }
    }, [showHint, currentIndex]);

    // Handle explanation usage
    useEffect(() => {
        if (showExplanation && currentQuestionRef.current === currentIndex) {
            const explanationMessage = getRandomMessage(teacherMessages.explanationUsed);
            updateMessage(explanationMessage);
        }
    }, [showExplanation, currentIndex]);

    // Handle advice usage
    useEffect(() => {
        if (showAdvice && currentQuestionRef.current === currentIndex) {
            const adviceMessage = getRandomMessage(teacherMessages.adviceUsed);
            updateMessage(adviceMessage);
        }
    }, [showAdvice, currentIndex]);

    // Handle question answered - show explanation prompt
    useEffect(() => {
        if (isQuestionAnswered && !showExplanation && !showHint && !showAdvice && currentQuestionRef.current === currentIndex) {
            const explanationPrompt = getRandomMessage(teacherMessages.askingForExplanation);
            updateMessage(explanationPrompt);
        }
    }, [isQuestionAnswered, showExplanation, showHint, showAdvice, currentIndex]);

    // Handle when explanation is shown - show advice prompt
    useEffect(() => {
        if (showExplanation && !showAdvice && currentQuestionRef.current === currentIndex) {
            const adviceTimeout = setTimeout(() => {
                if (currentQuestionRef.current === currentIndex && showExplanation && !showAdvice) {
                    const advicePrompt = getRandomMessage(teacherMessages.askingForAdvice);
                    updateMessage(advicePrompt);
                }
            }, 2000);
            
            messageTimeoutRef.current = adviceTimeout;
        }
    }, [showExplanation, showAdvice, currentIndex]);

    // Handle correct/incorrect answers
    useEffect(() => {
        if (isCorrect !== null && isQuestionAnswered && currentQuestionRef.current === currentIndex) {
            const messageArray = isCorrect ? teacherMessages.correct : teacherMessages.incorrect;
            const feedbackMessage = getRandomMessage(messageArray);
            
            updateMessage(feedbackMessage);
            
            const feedbackTimeout = setTimeout(() => {
                if (currentQuestionRef.current === currentIndex && isQuestionAnswered && !showExplanation && !showHint && !showAdvice) {
                    const explanationPrompt = getRandomMessage(teacherMessages.askingForExplanation);
                    updateMessage(explanationPrompt);
                }
            }, 3000);
            
            messageTimeoutRef.current = feedbackTimeout;
        }
    }, [isCorrect, isQuestionAnswered, showExplanation, showHint, showAdvice, currentIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, []);

    return (
        <>
            <h2 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
            }`}>{currentIndex + 1}. {question.question}</h2>
            
            <ul className="space-y-4 mb-6 stagger-animation">
                {question?.options && Object.entries(question.options).map(([key, value], i) => (
                    <li
                        key={key}
                        ref={options[i]}
                        onClick={(e) => onCheckAnswer(e, key)}
                        className={`qz-option border rounded-lg px-6 py-4 text-lg cursor-pointer transition-all select-none hover-lift hover-glow ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                                : 'bg-gray-50 border-gray-200 text-[#343434] hover:bg-gray-100'
                        }`}
                    >
                        {value}
                    </li>
                ))}
            </ul>

            {/* Teacher Avatar and Assistant - positioned below question options */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 mb-6">
                {/* Teacher Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                    <img 
                        src={teacherImage} 
                        alt="AI Teacher" 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Message with Typewriter Effect */}
                <div className="flex-1">
                    {showTypewriter ? (
                        <TypewriterEffect 
                            text={currentMessage}
                            speed={15}
                            delay={200}
                        />
                    ) : (
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {currentMessage}
                        </p>
                    )}
                </div>
                
                {/* Action Buttons */}
                {!isQuestionAnswered && !showHint && (
                    <button
                        onClick={onShowHint}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all hover:shadow-md ${
                            isDarkMode 
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                        }`}
                    >
                        Get Hint 💡
                    </button>
                )}
                {isQuestionAnswered && !showExplanation && (
                    <button
                        onClick={onShowExplanation}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all hover:shadow-md ${
                            isDarkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                        }`}
                    >
                        Explain 🧠
                    </button>
                )}
                {isQuestionAnswered && showExplanation && !showAdvice && (
                    <button
                        onClick={onShowAdvice}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all hover:shadow-md ${
                            isDarkMode 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }`}
                    >
                        Get Advice 🛠️
                    </button>
                )}
            </div>

            {showHint && (
                <div className="mb-4">
                    {/* Hint Message */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FaLightbulb className="text-yellow-500" /> 
                            <span className="font-semibold text-yellow-700 dark:text-yellow-300">Hint</span>
                        </div>
                        <div className="text-yellow-800 dark:text-yellow-200">
                            <TypewriterEffect 
                                text={question.hint}
                                speed={15}
                                delay={200}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {showExplanation && (
                <div className="mb-4">
                    {/* Explanation Message */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <GrNotes className="text-blue-500 text-xl" />
                            <span className="font-semibold text-blue-700 dark:text-blue-300">Explanation</span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold text-blue-900 dark:text-blue-100">Correct Answer:</span> 
                                <strong className="ml-1 text-blue-950 dark:text-blue-50">{question.options[question.answer]}</strong>
                            </div>
                            <div>
                                <span className="font-semibold text-blue-900 dark:text-blue-100">Why this is correct:</span> 
                                <div className="mt-1 text-blue-900 dark:text-blue-100">
                                    <TypewriterEffect 
                                        text={question.explanation}
                                        speed={15}
                                        delay={200}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showAdvice && (
                <div className="mb-4">
                    {/* Advice Message */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FaTools className="text-green-500" />
                            <span className="font-semibold text-green-900 dark:text-green-100">Advice</span>
                        </div>
                        <div className="text-green-900 dark:text-green-100">
                            <TypewriterEffect 
                                text={question.advice || "No advice available."}
                                speed={15}
                                delay={200}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuestionDisplay;
