import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { Trophy, Star, Award } from 'lucide-react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import TextDisplay from "../../Common/TextDisplay";
import teacherImage from '../../../assets/teacher.jpg';
import TypewriterEffect from '../../Common/TypewriterEffect';

const FeedbackSection = ({ showFeedback, feedback, score, onReset }) => {
    const { isDarkMode } = useDarkTheme();

    if (!showFeedback) return null;

    // Determine score category and color
    const getScoreInfo = (score) => {
        if (score >= 9) {
            return { category: 'Excellent', color: 'from-yellow-400 to-orange-500', icon: Trophy, bgColor: 'from-yellow-50 to-orange-50', borderColor: 'border-yellow-200 dark:border-yellow-700' };
        } else if (score >= 8) {
            return { category: 'Very Good', color: 'from-green-400 to-emerald-500', icon: Star, bgColor: 'from-green-50 to-emerald-50', borderColor: 'border-green-200 dark:border-green-700' };
        } else if (score >= 7) {
            return { category: 'Good', color: 'from-blue-400 to-indigo-500', icon: Award, bgColor: 'from-blue-50 to-indigo-50', borderColor: 'border-blue-200 dark:border-blue-700' };
        } else if (score >= 6) {
            return { category: 'Fair', color: 'from-purple-400 to-pink-500', icon: Award, bgColor: 'from-purple-50 to-pink-50', borderColor: 'border-purple-200 dark:border-purple-700' };
        } else {
            return { category: 'Needs Improvement', color: 'from-red-400 to-pink-500', icon: Award, bgColor: 'from-red-50 to-pink-50', borderColor: 'border-red-200 dark:border-red-700' };
        }
    };

    const scoreInfo = score ? getScoreInfo(score) : null;
    const IconComponent = scoreInfo?.icon || Award;

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
                <div className={`flex-1 bg-gradient-to-r ${scoreInfo?.bgColor || 'from-green-50 to-emerald-50'} dark:from-green-900/20 dark:to-emerald-900/20 text-gray-900 dark:text-gray-100 border ${scoreInfo?.borderColor || 'border-green-200 dark:border-green-700'} rounded-2xl p-4 relative`}>
                   
                    
                    {/* Score Display */}
                    {score !== undefined && score !== null ? (
                        <div className="mb-4 text-center">
                            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className={`w-12 h-12 bg-gradient-to-r ${scoreInfo.color} rounded-full flex items-center justify-center`}>
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {score}/10
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {scoreInfo.category}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 text-center">
                            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        No Score
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Review Required
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">
                        Feedback on your answer
                    </h3>
                    
                    <div className="mb-4">
                        <TextDisplay 
                            content={feedback}
                            forceBlackText={false}
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
