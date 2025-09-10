import React from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import TeacherLoadingScreen from '../../Common/TeacherLoadingScreen';

const LoadingState = ({ isLoading }) => {
    const { isDarkMode } = useDarkTheme();

    if (!isLoading) return null;

    return (
        <div className={`min-h-screen flex flex-col ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
        }`}>
            <div className={`fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${
                isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'
            }`}>
                <TeacherLoadingScreen 
                    message="Teacher is analyzing your previous mistakes..."
                    size="large"
                />
            </div>
        </div>
    );
};

export default LoadingState;
