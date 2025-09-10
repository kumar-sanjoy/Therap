import React from 'react';
import { ArrowLeft, BookOpen, Target, Star, Menu, X, GraduationCap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkTheme } from '../Common/DarkThemeProvider';
import flowLogoLight from '../../assets/flow-main-nobg.png';
import flowLogoDark from '../../assets/flow-dark.png';

const Header = ({ lessonData, showSidebar, setShowSidebar }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();

  return (
    <>
      {/* Flow Navigation Header */}
      <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-4">
          <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="h-10" />
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <GraduationCap className="w-4 h-4" />
            <span>Learning Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-[#343434] hover:text-white"
            onClick={() => navigate('/main')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Chapter Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Sidebar Toggle */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
                title="Toggle navigation menu"
              >
                {showSidebar ? 
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : 
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                }
              </button>
            </div>
            
            {/* Class, Subject, Chapter Info - Center */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lessonData.class}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lessonData.subject}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Chapter {lessonData.chapter}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Session indicator */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Active Session</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
