import React from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const ErrorDisplay = ({ error }) => {
    const { isDarkMode } = useDarkTheme();

    if (!error) return null;

    return (
        <div className={`mb-6 p-4 border rounded-xl shadow-sm ${
            isDarkMode 
                ? 'bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-700' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        }`}>
            <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-red-300' : 'text-red-600'
                }`}>
                    {error}
                </p>
            </div>
        </div>
    );
};

export default ErrorDisplay;
