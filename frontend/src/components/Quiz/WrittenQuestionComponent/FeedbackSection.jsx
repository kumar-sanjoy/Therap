import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import TextDisplay from "../../Common/TextDisplay";
import teacherImage from '../../../assets/teacher.jpg';
import TypewriterEffect from '../../Common/TypewriterEffect';

const FeedbackSection = ({ showFeedback, feedback, onReset }) => {
    const { isDarkMode } = useDarkTheme();

    if (!showFeedback) return null;

    return (
        <div className="mt-8">
            <div className="flex items-start gap-3">
                {/* Teacher Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-500">
                    <img 
                        src={teacherImage} 
                        alt="AI Teacher" 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Feedback Message */}
                <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-gray-900 dark:text-gray-100 border border-green-200 dark:border-green-700 rounded-2xl p-4 relative">
                    {/* Teacher name */}
                    <div className="absolute -top-2 left-4 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700">
                        AI Teacher
                    </div>
                    
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">
                        Feedback on your answer
                    </h3>
                    
                    <div className="mb-4">
                        <TypewriterEffect 
                            text={feedback}
                            speed={20}
                            delay={500}
                            className="leading-relaxed"
                        />
                    </div>
                    
                    <div className="flex justify-center">
                        <button 
                            onClick={onReset}
                            className={`px-6 py-3 border font-medium rounded-lg transition-all hover:shadow-md flex items-center space-x-2 ${
                                isDarkMode 
                                    ? 'bg-white border-gray-300 hover:bg-gray-100 text-gray-900' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50 text-[#343434]'
                            }`}
                        >
                            <IoMdArrowRoundBack className="w-4 h-4" />
                            <span>Back to Main</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackSection;
