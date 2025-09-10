import React from 'react';
import { GrNotes } from 'react-icons/gr';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import TeacherLoadingScreen from '../../Common/TeacherLoadingScreen';

const LoadingState = ({ isLoading, isSubmitting }) => {
    const { isDarkMode } = useDarkTheme();

    // Only show loading for initial quiz loading, not for submission
    if (!isLoading) return null;

    return (
        <div className={`min-h-screen flex flex-col ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
        }`}>
            <div className={`fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${
                isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
            }`}>
                <TeacherLoadingScreen 
                    message="Teacher is preparing your quiz questions..."
                    size="large"
                />
            </div>
        </div>
    );
};

export default LoadingState;
