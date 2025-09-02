import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const SubmitButton = ({ onSubmit, isSubmitting, image, isLoadingQuestion }) => {
    const { isDarkMode } = useDarkTheme();

    return (
        <div className="flex justify-center">
            <button 
                onClick={onSubmit} 
                disabled={isSubmitting || !image || isLoadingQuestion} 
                className={`px-8 py-4 font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 ${
                    isDarkMode 
                        ? 'bg-white hover:bg-gray-100 text-gray-900' 
                        : 'bg-[#343434] hover:from-gray-800 hover:to-gray-900 text-white'
                }`}
            >
                {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <FaCheckCircle className="w-5 h-5" />
                        <span>Submit Answer</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default SubmitButton;
