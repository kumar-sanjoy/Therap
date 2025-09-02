import React, { useState, useEffect, useRef } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import teacherImage from '../../../assets/teacher.jpg';
import TypewriterEffect from '../../Common/TypewriterEffect';

const QuestionDisplay = ({ 
    question, 
    currentIndex, 
    options, 
    onCheckAnswer, 
    showHint, 
    showExplanation,
    isQuestionAnswered,
    isCorrect,
    onShowHint,
    onShowExplanation,
    hintTaken
}) => {
    const { isDarkMode } = useDarkTheme();
    
    // State for learning tips and timer
    const [currentTip, setCurrentTip] = useState('');
    const [showHintPrompt, setShowHintPrompt] = useState(false);
    const [timer, setTimer] = useState(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const [showTypewriter, setShowTypewriter] = useState(false);
    
    // Add refs to track current question and prevent stale updates
    const currentQuestionRef = useRef(currentIndex);
    const messageTimeoutRef = useRef(null);

    // Message arrays from TeacherAssistant
    const messages = {
        correct: [
            "Excellent work! 🎉",
            "Perfect! You're on fire! 🔥",
            "Brilliant answer! 🌟",
            "Outstanding! Keep it up! 💪",
            "Fantastic! You're learning so well! 🚀",
            "Amazing! You've got this! ⭐",
            "Superb! You're making great progress! 🎯",
            "Wonderful! Your hard work is paying off! 🌈",
            "Incredible! You're absolutely crushing it! 🏆",
            "Bravo! That's the spirit! 🎊"
        ],
        incorrect: [
            "Don't worry, mistakes help us learn! 💡",
            "That's okay! Let's try again together! 🤝",
            "Great effort! Every attempt brings you closer! 🌱",
            "No problem! Learning is a journey! 🛤️",
            "Keep going! You're getting better each time! 📈",
            "That's part of learning! You've got this! 💪",
            "Don't give up! You're doing great! 🌟",
            "Mistakes are stepping stones to success! 🧱",
            "You're on the right track! Let's figure this out! 🔍",
            "Stay positive! You're learning valuable lessons! 📚"
        ],
        hintUsed: [
            "Great! You used a hint - that's smart thinking! 💡",
            "Perfect! Hints are there to help you learn! 🎯",
            "Excellent! You're using your resources wisely! 🧠",
            "Brilliant! That's exactly how to use hints effectively! ⭐",
            "Wonderful! You're learning the right way! 🌟",
            "Amazing! Using hints shows good problem-solving! 🚀",
            "Outstanding! You're making the most of your learning tools! 💪",
            "Superb! That's the kind of strategic thinking I love! 🎊",
            "Incredible! You're mastering the art of learning! 🏆",
            "Bravo! You're using hints like a pro! 🌈"
        ],
        explanationUsed: [
            "Perfect! You're seeking deeper understanding! 🧠",
            "Excellent! Explanations help build strong foundations! 🏗️",
            "Brilliant! You're going beyond just the answer! 💡",
            "Wonderful! Understanding the 'why' is crucial! 🎯",
            "Amazing! You're building lasting knowledge! 🌟",
            "Outstanding! That's how you truly master concepts! 💪",
            "Superb! You're developing critical thinking skills! 🚀",
            "Incredible! You're becoming a deep learner! 🎊",
            "Fantastic! You're building a strong knowledge base! 🏆",
            "Bravo! You're learning the right way! 🌈"
        ],
        askingForHint: [
            "Do you need a hint to help you with this question? 🤔",
            "Would you like me to give you a little hint? 💡",
            "Are you stuck? I can provide a helpful hint! 🎯",
            "Need some guidance? I'm here to help with a hint! 🧠",
            "Would a hint help you figure this out? 🌟",
            "Let me know if you'd like a hint to get started! 💪",
            "Are you finding this challenging? I can offer a hint! 🚀",
            "Need a little push in the right direction? 💡",
            "Would you like me to give you a helpful hint? 🎊",
            "I'm here to help! Would you like a hint? 🌈"
        ],
        askingForExplanation: [
            "Would you like me to explain the answer? 🧠",
            "Should I show you why this is the correct answer? 💡",
            "Would you like me to explain the reasoning? 🎯",
            "Let me know if you want to understand why this is correct! 🌟",
            "Would you like me to walk you through the explanation? 💪",
            "Should I explain the logic behind this answer? 🚀",
            "Would you like me to break down why this is right? 🎊",
            "Let me know if you want the full explanation! 🌈",
            "Would you like me to explain the concept? 💎",
            "Should I show you the detailed explanation? 🏆"
        ]
    };

    // Learning tips array
    const learningTips = [
        "💡 Tip: Read each question carefully and look for keywords that might give you clues about the answer.",
        "🎯 Tip: If you're unsure, try eliminating the obviously wrong answers first. This increases your chances of getting it right.",
        "🧠 Tip: Don't hesitate to use hints when you're stuck. They're there to help you learn, not just to get the answer.",
        "📝 Tip: Before submitting, take a moment to review your answers. Trust your instincts but double-check your reasoning.",
        "🔍 Tip: Take your time to read each question thoroughly. Look for keywords that might give you clues about the answer.",
        "⚡ Tip: Process of elimination is your friend - cross out obviously wrong answers first!",
        "🎪 Tip: Stay focused and don't rush. Accuracy is more important than speed.",
        "🌟 Tip: Every question is a learning opportunity, even if you get it wrong.",
        "💪 Tip: Trust your knowledge and instincts. You've prepared for this!",
        "🚀 Tip: Use the hints wisely - they're designed to guide your thinking, not just give you the answer."
    ];

    // Function to get random message from array
    const getRandomMessage = (messageArray) => {
        return messageArray[Math.floor(Math.random() * messageArray.length)];
    };

    // Function to update message with typewriter effect
    const updateMessage = (newMessage) => {
        // Clear any existing timeout
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
        
        setShowTypewriter(false);
        messageTimeoutRef.current = setTimeout(() => {
            // Only update if we're still on the same question
            if (currentQuestionRef.current === currentIndex) {
                setCurrentMessage(newMessage);
                setShowTypewriter(true);
            }
        }, 100);
    };

    // Function to clear all timeouts and reset state
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
        // Update the current question ref
        currentQuestionRef.current = currentIndex;
        
        // Clear all existing timeouts
        clearAllTimeouts();

        // Reset states for new question
        setShowHintPrompt(false);
        setShowTypewriter(false);
        
        // Set a random learning tip
        const randomTip = learningTips[Math.floor(Math.random() * learningTips.length)];
        setCurrentMessage(randomTip);
        setShowTypewriter(true);

        // Set timer for 17 seconds to show hint prompt ONLY if question is not answered and hint not taken
        if (!isQuestionAnswered && !hintTaken) {
            const newTimer = setTimeout(() => {
                // Only show hint prompt if we're still on the same question, it's still not answered, and hint not taken
                if (currentQuestionRef.current === currentIndex && !isQuestionAnswered && !hintTaken) {
                    setShowHintPrompt(true);
                    const hintPrompt = getRandomMessage(messages.askingForHint);
                    updateMessage(hintPrompt);
                }
            }, 17000); // 17 seconds
            
            setTimer(newTimer);
        }

        // Cleanup function
        return () => {
            clearAllTimeouts();
        };
    }, [currentIndex, isQuestionAnswered, hintTaken]);

    // Handle hint usage
    useEffect(() => {
        if (showHint && currentQuestionRef.current === currentIndex) {
            const hintMessage = getRandomMessage(messages.hintUsed);
            updateMessage(hintMessage);
        }
    }, [showHint, currentIndex]);

    // Handle explanation usage
    useEffect(() => {
        if (showExplanation && currentQuestionRef.current === currentIndex) {
            const explanationMessage = getRandomMessage(messages.explanationUsed);
            updateMessage(explanationMessage);
        }
    }, [showExplanation, currentIndex]);

    // Handle question answered - only show explanation prompt if not already showing hint
    useEffect(() => {
        if (isQuestionAnswered && !showExplanation && !showHint && currentQuestionRef.current === currentIndex) {
            const explanationPrompt = getRandomMessage(messages.askingForExplanation);
            updateMessage(explanationPrompt);
        }
    }, [isQuestionAnswered, showExplanation, showHint, currentIndex]);

    // Handle correct/incorrect answers
    useEffect(() => {
        if (isCorrect !== null && isQuestionAnswered && currentQuestionRef.current === currentIndex) {
            const messageArray = isCorrect ? messages.correct : messages.incorrect;
            const feedbackMessage = getRandomMessage(messageArray);
            
            // Show feedback for 3 seconds, then show explanation prompt
            updateMessage(feedbackMessage);
            
            const feedbackTimeout = setTimeout(() => {
                // Only show explanation prompt if we're still on the same question and it's still answered and not showing hint
                if (currentQuestionRef.current === currentIndex && isQuestionAnswered && !showExplanation && !showHint) {
                    const explanationPrompt = getRandomMessage(messages.askingForExplanation);
                    updateMessage(explanationPrompt);
                }
            }, 3000);
            
            // Store the timeout for cleanup
            messageTimeoutRef.current = feedbackTimeout;
        }
    }, [isCorrect, isQuestionAnswered, showExplanation, showHint, currentIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, []);

    return (
        <>
            <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>
                {currentIndex + 1}. {question.question}
            </h2>
            
            <ul className="space-y-4 mb-6 stagger-animation">
                {Object.entries(question.options).map(([key, value], i) => (
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
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {currentMessage}
                        </div>
                    )}
                </div>
                
                {/* Action Buttons */}
                {!isQuestionAnswered && !showHint && !hintTaken && (
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
        </>
    );
};

export default QuestionDisplay;
