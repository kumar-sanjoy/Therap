import React from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const ActionButtons = ({ 
    currentIndex,
    totalQuestions,
    questionData,
    isQuestionAnswered,
    showHint,
    showExplanation,
    showAdvice,
    onShowHint,
    onShowExplanation,
    onShowAdvice,
    isIncorrectAnswer
}) => {
    const { isDarkMode } = useDarkTheme();

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Question counter */}
            <div className="flex justify-end">
                <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{currentIndex + 1} of {totalQuestions}</div>
            </div>
            
            {/* Action Buttons - Removed after answering, buttons now only in teacher avatar */}
        </div>
    );
};

export default ActionButtons;
