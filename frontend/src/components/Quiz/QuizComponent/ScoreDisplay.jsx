import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTrophy, FaStar, FaHeart, FaFire } from 'react-icons/fa';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import TypewriterEffect from '../../Common/TypewriterEffect';
import teacherImage from '../../../assets/teacher.jpg';

const ScoreDisplay = ({ score, totalQuestions, onReset, leaderboard }) => {
    const { isDarkMode } = useDarkTheme();
    const [showTypewriter, setShowTypewriter] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);

    // Motivational messages based on performance
    const motivationalMessages = {
        excellent: [
            "🎉 Outstanding! You're absolutely crushing it!",
            "🏆 Phenomenal work! You're a true champion!",
            "⭐ Exceptional performance! You're unstoppable!",
            "🔥 Incredible! You're on fire today!",
            "💎 Brilliant! You're absolutely brilliant!",
            "🚀 Amazing! You're reaching new heights!",
            "🌟 Spectacular! You're shining bright!",
            "💪 Outstanding! You're incredibly strong!",
            "🎊 Fantastic! You're absolutely fantastic!",
            "✨ Magnificent! You're absolutely magnificent!"
        ],
        good: [
            "🎯 Great job! You're doing really well!",
            "👍 Excellent work! Keep up the great effort!",
            "💪 Strong performance! You're getting stronger!",
            "🌟 Wonderful! You're making great progress!",
            "🎉 Well done! You're on the right track!",
            "⭐ Good work! You're showing real potential!",
            "🔥 Nice! You're building momentum!",
            "💎 Solid performance! You're developing well!",
            "🚀 Good going! You're moving forward!",
            "✨ Well played! You're doing great!"
        ],
        average: [
            "📚 Good effort! Every attempt helps you learn!",
            "🌱 You're growing! Keep pushing forward!",
            "💡 Nice try! You're learning valuable lessons!",
            "🎯 Keep going! You're building your skills!",
            "💪 Don't give up! You're getting stronger!",
            "🌟 Stay positive! You're making progress!",
            "🔥 Keep the fire burning! You're improving!",
            "💎 Every challenge makes you stronger!",
            "🚀 Keep climbing! You're on your way!",
            "✨ Believe in yourself! You can do better!"
        ],
        needsImprovement: [
            "💪 Don't worry! Every mistake is a learning opportunity!",
            "🌱 You're growing stronger with each attempt!",
            "📚 Keep studying! Knowledge is power!",
            "🎯 Stay focused! You're building your foundation!",
            "💡 Every challenge helps you improve!",
            "🌟 Keep your head up! You're learning!",
            "🔥 Don't give up! Your potential is limitless!",
            "💎 Every setback is a setup for a comeback!",
            "🚀 Keep pushing! You're developing resilience!",
            "✨ Believe in yourself! You have what it takes!"
        ]
    };

    // Get appropriate message category and random message
    const getMessageCategory = () => {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 70) return 'good';
        if (percentage >= 50) return 'average';
        return 'needsImprovement';
    };

    const getRandomMessage = (category) => {
        const messages = motivationalMessages[category];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    // Get appropriate icon based on performance
    const getPerformanceIcon = () => {
        if (percentage >= 90) return <FaTrophy className="text-yellow-500 text-6xl mb-4" />;
        if (percentage >= 70) return <FaStar className="text-blue-500 text-6xl mb-4" />;
        if (percentage >= 50) return <FaHeart className="text-pink-500 text-6xl mb-4" />;
        return <FaFire className="text-orange-500 text-6xl mb-4" />;
    };

    // Set up message when component mounts
    useEffect(() => {
        const category = getMessageCategory();
        const message = getRandomMessage(category);
        setCurrentMessage(message);
        setShowTypewriter(true);
    }, [score, totalQuestions]);

    return (
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
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 max-w-md">
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
                    {showTypewriter ? (
                        <TypewriterEffect 
                            text={currentMessage}
                            speed={20}
                            delay={500}
                        />
                    ) : (
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {currentMessage}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Leaderboard (for challenge attempts) */}
            {leaderboard && (
                <div className="w-full max-w-md">
                    <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>
                        Leaderboard
                    </h3>
                    <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}>
                        <ul className="space-y-2">
                            {Object.entries(leaderboard)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name, sc], idx) => (
                                    <li key={name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-500')} font-semibold`}>{idx + 1}.</span>
                                            <span className={`${isDarkMode ? 'text-gray-200' : 'text-[#343434]'} font-medium`}>{name}</span>
                                        </div>
                                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-[#343434]'} font-semibold`}>{sc}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Background Submission Notice */}
            <div className={`text-xs text-center px-4 py-2 rounded-lg ${
                isDarkMode 
                    ? 'bg-gray-700/50 text-gray-300 border border-gray-600' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Your results are being saved automatically</span>
                </div>
            </div>
            
            {/* Action Button */}
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
    );
};

export default ScoreDisplay;
