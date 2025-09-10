import React, { useState } from 'react';
import { FaCheckCircle, FaTools, FaTrophy, FaStar, FaHeart, FaFire, FaTimes } from 'react-icons/fa';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import { teacherMessages, getRandomMessage } from '../../Common/TeacherMessages';
import TypewriterEffect from '../../Common/TypewriterEffect';
import teacherImage from '../../../assets/teacher.jpg';

const ScoreDisplay = ({ score, totalQuestions, incorrectQuestions, onReset }) => {
    const { isDarkMode } = useDarkTheme();
    const [selectedAdvice, setSelectedAdvice] = useState(null);

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Get motivational message based on performance
    const getMotivationalMessage = () => {
        if (percentage >= 90) {
            return getRandomMessage(teacherMessages.completed);
        } else if (percentage >= 70) {
            return getRandomMessage(teacherMessages.learning);
        } else if (percentage >= 50) {
            return getRandomMessage(teacherMessages.motivational);
        } else {
            return getRandomMessage(teacherMessages.incorrect);
        }
    };

    // Get appropriate icon based on performance
    const getPerformanceIcon = () => {
        if (percentage >= 90) return <FaTrophy className="text-yellow-500 text-6xl mb-4" />;
        if (percentage >= 70) return <FaStar className="text-blue-500 text-6xl mb-4" />;
        if (percentage >= 50) return <FaHeart className="text-pink-500 text-6xl mb-4" />;
        return <FaFire className="text-orange-500 text-6xl mb-4" />;
    };

    const motivationalMessage = getMotivationalMessage();

    const handleAdviceClick = (adviceItem) => {
        setSelectedAdvice(adviceItem);
    };

    const closeAdviceModal = () => {
        setSelectedAdvice(null);
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center gap-6">
                {/* Performance Icon */}
                {getPerformanceIcon()}
                
                {/* Score Display */}
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>
                    You scored {score} out of {totalQuestions}
                </h2>
                
                {/* Percentage Display */}
                <div className={`text-xl font-semibold ${
                    percentage >= 90 ? 'text-green-600 dark:text-green-400' :
                    percentage >= 70 ? 'text-blue-600 dark:text-blue-400' :
                    percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-orange-600 dark:text-orange-400'
                }`}>
                    {percentage}%
                </div>
                
                {/* Teacher Avatar and Motivational Message */}
                <div className={`flex items-center gap-4 p-4 rounded-xl border max-w-lg w-full ${
                    isDarkMode 
                        ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-700' 
                        : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                }`}>
                    {/* Teacher Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                        <img 
                            src={teacherImage} 
                            alt="AI Teacher" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Motivational Message */}
                    <div className="flex-1">
                        <TypewriterEffect 
                            text={motivationalMessage}
                            speed={20}
                            delay={500}
                        />
                    </div>
                </div>

                {/* Show advice for incorrect questions */}
                {incorrectQuestions.length > 0 && (
                    <div className="w-full">
                        <h3 className={`text-xl font-semibold mb-4 text-center ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                            💡 Advice for Questions You Missed
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {incorrectQuestions.map((item, index) => (
                                <div 
                                    key={index}
                                    onClick={() => handleAdviceClick(item)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg hover:bg-opacity-80 ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 hover:border-indigo-400 hover:bg-gray-600' 
                                            : 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 p-2 rounded-lg ${
                                            isDarkMode 
                                                ? 'bg-green-600' 
                                                : 'bg-green-100'
                                        }`}>
                                            <FaTools className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-green-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-semibold mb-1 ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Question {item.questionNumber}
                                            </div>
                                            <div className={`text-xs mb-2 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {item.question.length > 100 
                                                    ? `${item.question.substring(0, 100)}...` 
                                                    : item.question
                                                }
                                            </div>
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-green-300' : 'text-green-800'
                                            }`}>
                                                <TypewriterEffect 
                                                    text={item.advice}
                                                    speed={10}
                                                    delay={100}
                                                />
                                            </div>
                                            <div className={`text-xs mt-2 ${
                                                isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                            }`}>
                                                Click to see full details →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    className={`px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md ${
                        isDarkMode 
                            ? 'bg-white hover:bg-gray-100 text-gray-900' 
                            : 'bg-[#343434] hover:bg-gray-800 text-white'
                    }`} 
                    onClick={onReset}
                >
                    Go Back
                </button>
            </div>

            {/* Detailed Advice Modal */}
            {selectedAdvice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl ${
                        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between p-6 border-b ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500">
                                    <img 
                                        src={teacherImage} 
                                        alt="AI Teacher" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Question {selectedAdvice.questionNumber}</h2>
                                    <p className={`text-sm ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        Detailed Analysis
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeAdviceModal}
                                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Question */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-3 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                    Question:
                                </h3>
                                <div className={`p-4 rounded-xl ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <p className="text-base leading-relaxed">
                                        {selectedAdvice.question}
                                    </p>
                                </div>
                            </div>

                            {/* Advice */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-3 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                    <FaTools className="inline mr-2 text-green-500" />
                                    Advice:
                                </h3>
                                <div className={`p-4 rounded-xl ${
                                    isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                                }`}>
                                    <div className={`text-base leading-relaxed ${
                                        isDarkMode ? 'text-blue-300' : 'text-blue-800'
                                    }`}>
                                        <TypewriterEffect 
                                            text={selectedAdvice.advice}
                                            speed={10}
                                            delay={100}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`p-6 border-t ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <button
                                onClick={closeAdviceModal}
                                className={`w-full px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md ${
                                    isDarkMode 
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScoreDisplay;
