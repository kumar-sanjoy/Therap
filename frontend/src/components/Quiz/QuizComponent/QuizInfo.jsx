import React from 'react';
import { BookOpen, Target, Star } from 'lucide-react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const QuizInfo = ({ quizInfo }) => {
    const { isDarkMode } = useDarkTheme();

    return (
        <div className={`px-8 py-6 border-b ${
            isDarkMode 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' 
                : 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-100'
        }`}>
            <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>
                        {quizInfo.class}
                    </span>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>
                        {quizInfo.subject}
                    </span>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-[#343434]'}`}>
                        Chapter {quizInfo.chapter}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuizInfo;
