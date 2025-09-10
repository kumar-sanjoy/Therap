import React from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const QuestionCard = ({ question, isLoadingQuestion }) => {
    const { isDarkMode } = useDarkTheme();

    return (
        <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-8 ${
            isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-200'
        }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
            }`}>
                <svg className={`w-5 h-5 ${
                    isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Question
            </h2>
            <div className={`rounded-xl p-6 border ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
            }`}>
                {isLoadingQuestion ? (
                    <div className="flex items-center justify-center space-x-3">
                        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${
                            isDarkMode 
                                ? 'border-gray-600 border-t-green-400' 
                                : 'border-gray-300 border-t-green-500'
                        }`}></div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading question...</p>
                    </div>
                ) : (
                    <p className={`text-lg leading-relaxed ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{question}</p>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
