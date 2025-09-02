import React from 'react';
import { useDarkTheme } from './DarkThemeProvider';
import teacherImage from '../../assets/teacher.jpg';
import { FloatingParticles, AnimatedPulseRing } from './AnimatedComponents';

const TeacherLoadingScreen = ({ 
  message = "Teacher is preparing your content...",
  showTyping = true,
  size = 'medium'
}) => {
  const { isDarkMode } = useDarkTheme();

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xlarge: 'w-24 h-24'
  };

  return (
    <div className={`relative flex flex-col items-center justify-center py-8 px-4 ${
      isDarkMode ? 'text-gray-200' : 'text-gray-700'
    }`}>
      {/* Floating Particles Background */}
      <FloatingParticles count={12} color="indigo" />
      
      {/* Teacher Avatar with Enhanced Animation */}
      <div className="relative mb-6 animate-bounce-in">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 ${
          isDarkMode 
            ? 'border-indigo-500 bg-gray-800 shadow-lg' 
            : 'border-indigo-500 bg-white shadow-xl'
        } animate-pulse hover-lift`}>
          <img 
            src={teacherImage} 
            alt="AI Teacher" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Enhanced Thinking indicator */}
        {showTyping && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center animate-bounce">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        {/* Pulse Ring Effect */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-300/30 animate-ping"></div>
      </div>

      {/* Loading Message with Animation */}
      <div className="text-center animate-fade-in-up">
        <h3 className={`text-lg font-semibold mb-2 ${
          isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
        }`}>
          AI Teacher
        </h3>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {message}
        </p>
      </div>

      {/* Enhanced Loading Dots */}
      <div className="flex space-x-2 mt-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {/* Animated Progress Ring */}
      <div className="mt-6">
        <AnimatedPulseRing size="medium" color="indigo" />
      </div>
    </div>
  );
};

export default TeacherLoadingScreen;
