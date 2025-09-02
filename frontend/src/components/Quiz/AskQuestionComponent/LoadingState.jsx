import React from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider.jsx';
import TeacherLoadingScreen from '../../Common/TeacherLoadingScreen';

const LoadingState = ({ isSubmitting }) => {
    const { isDarkMode } = useDarkTheme();

    if (!isSubmitting) return null;

    return (
        <div className="mx-auto max-w-2xl mb-8">
            <TeacherLoadingScreen 
                message="Teacher is thinking about your question..."
                size="medium"
            />
        </div>
    );
};

export default LoadingState;
