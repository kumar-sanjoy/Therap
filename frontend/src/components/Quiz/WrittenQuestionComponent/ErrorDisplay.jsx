import React from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const ErrorDisplay = ({ error }) => {
    const { isDarkMode } = useDarkTheme();

    if (!error) return null;

    return (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
        </div>
    );
};

export default ErrorDisplay;
