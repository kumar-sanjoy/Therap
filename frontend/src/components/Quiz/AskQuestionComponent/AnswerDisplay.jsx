import React from 'react';
import TextDisplay from '../../Common/TextDisplay.jsx';
import { useDarkTheme } from '../../Common/DarkThemeProvider.jsx';
import teacherImage from '../../../assets/teacher.jpg';
import TypewriterEffect from '../../Common/TypewriterEffect.jsx';

const AnswerDisplay = ({ showAnswer, question, answer }) => {
    const { isDarkMode } = useDarkTheme();

    if (!showAnswer) return null;

    const handleDownload = () => {
        const element = document.createElement('a');
        const content = `Question: ${question}\n\nAnswer: ${answer}`;
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `answer_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="mx-auto max-w-2xl mb-8">
            <div className="flex items-start gap-3">
                {/* Teacher Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-500">
                    <img 
                        src={teacherImage} 
                        alt="AI Teacher" 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Answer Message */}
                <div className="flex-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 border border-indigo-200 dark:border-indigo-700 rounded-2xl p-4 relative">
                    {/* Teacher name */}
                    <div className="absolute -top-2 left-4 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700">
                        AI Teacher
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                            Answer to your question
                        </h3>
                        <button
                            onClick={handleDownload}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                            }`}
                            title="Download answer as text file"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                        </button>
                    </div>
                    
                    <div className="max-w-full overflow-hidden">
                        <TypewriterEffect 
                            text={answer}
                            speed={20}
                            delay={500}
                            className="leading-relaxed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnswerDisplay;
