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
            
            {/* Action Buttons - Only show when question is answered */}
            {isQuestionAnswered && (
                <div className="flex flex-wrap gap-3 justify-center">
                    {/* Hint Button */}
                    {!showHint && (
                        <button
                            onClick={onShowHint}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                isDarkMode 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            💡 Show Hint
                        </button>
                    )}
                    
                    {/* Explanation Button */}
                    {!showExplanation && (
                        <button
                            onClick={onShowExplanation}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                isDarkMode 
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                        >
                            📚 Show Explanation
                        </button>
                    )}
                    
                    {/* Advice Button - Only show for incorrect answers */}
                    {isIncorrectAnswer && !showAdvice && (
                        <button
                            onClick={onShowAdvice}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                isDarkMode 
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                        >
                            🎯 Get Advice
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActionButtons;
