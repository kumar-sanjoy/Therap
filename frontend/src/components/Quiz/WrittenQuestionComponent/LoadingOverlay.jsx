import React from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import TeacherLoadingScreen from '../../Common/TeacherLoadingScreen';

const LoadingOverlay = ({ isSubmitting }) => {
    const { isDarkMode } = useDarkTheme();
    
    if (!isSubmitting) return null;

    return (
        <div className={`fixed inset-0 backdrop-blur-lg flex flex-col items-center justify-center z-50 ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95' 
                : 'bg-gradient-to-br from-blue-50/95 via-white/95 to-green-50/95'
        }`}>
            <TeacherLoadingScreen 
                message="Teacher is carefully reviewing your handwritten answer..."
                size="xlarge"
            />
        </div>
    );
};

export default LoadingOverlay;
