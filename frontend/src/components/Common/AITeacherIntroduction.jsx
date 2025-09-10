import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDarkTheme } from './DarkThemeProvider';
import { Heart, BookOpen, MessageCircle, Star, Sparkles } from 'lucide-react';
import teacherImage from '../../assets/teacher.jpg';

// Step configuration for the introduction modal
const steps = [
  {
    icon: <Heart className="w-8 h-8 text-pink-500" />,
    title: 'Welcome! Meet Your AI Teacher',
    content:
      'I’m your personal tutor, here to guide you through your learning journey. I’m always available to explain concepts, answer questions, and provide feedback.',
    bgColor: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-200',
    darkBgColor: 'from-pink-900/20 to-rose-900/20',
    darkBorderColor: 'border-pink-700',
  },
  {
    icon: <BookOpen className="w-8 h-8 text-blue-500" />,
    title: 'Your Companion for Every Lesson',
    content:
      'From learning new concepts to practicing with quizzes, I’ll support you every step of the way. I’ll explain tough topics, offer hints, and celebrate your progress.',
    bgColor: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    darkBgColor: 'from-blue-900/20 to-indigo-900/20',
    darkBorderColor: 'border-blue-700',
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-green-500" />,
    title: 'Ask Anything, Anytime',
    content:
      'No question is too big or too small. I’m here to clarify doubts, provide personalized explanations, and help you master any topic.',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    darkBgColor: 'from-green-900/20 to-emerald-900/20',
    darkBorderColor: 'border-green-700',
  },
  {
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    title: 'Let’s Learn Together!',
    content:
      'I’m excited to join you on this educational adventure. Let’s make learning engaging, fun, and effective. Ready to get started?',
    bgColor: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200',
    darkBgColor: 'from-yellow-900/20 to-amber-900/20',
    darkBorderColor: 'border-yellow-700',
  },
];

const AITeacherIntroduction = ({ isOpen, onClose }) => {
  const { isDarkMode } = useDarkTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Handle modal visibility and reset step on open/close
  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isVisible) return null;

  const { icon, title, content, bgColor, borderColor, darkBgColor, darkBorderColor } = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div
      className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Modal Container with Glow Effect */}
      <div
        className={`relative z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg mx-auto shadow-2xl border border-white/20 dark:border-gray-700/50 transform transition-all duration-300 min-h-[500px] flex flex-col ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          boxShadow: `
            0 0 0 1px rgba(99, 102, 241, 0.1),
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 20px rgba(99, 102, 241, 0.3),
            0 0 40px rgba(139, 92, 246, 0.2),
            0 0 60px rgba(236, 72, 153, 0.1)
          `
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Teacher Avatar with Enhanced Effects and Better Sparkle Positioning */}
        <div className="relative flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gradient-to-r from-indigo-500 to-purple-500 shadow-2xl relative">
            <img src={teacherImage} alt="AI Teacher" className="w-full h-full object-cover" />
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping"></div>
          </div>
          <Sparkles
            className="absolute top-2 left-9 w-7 h-7 text-yellow-500 animate-bounce drop-shadow-lg"
            aria-hidden="true"
          />
          <Sparkles
            className="absolute -bottom-1 -left-1 w-5 h-5 text-pink-400 animate-bounce drop-shadow-lg"
            style={{ animationDelay: '0.5s' }}
            aria-hidden="true"
          />
          
          {/* Right side sparkle */}
          <Sparkles
            className="absolute top-1/2 right-6 w-4 h-4 text-cyan-400 animate-bounce drop-shadow-lg"
            style={{ animationDelay: '1.5s' }}
            aria-hidden="true"
          />
        </div>

        {/* Step Content with Fixed Height and Glow */}
        <div
          className={`p-6 rounded-2xl border mb-6 flex-1 flex flex-col justify-center ${
            isDarkMode
              ? `bg-gradient-to-br ${darkBgColor} ${darkBorderColor} shadow-lg`
              : `bg-gradient-to-br ${bgColor} ${borderColor} shadow-lg`
          }`}
          style={{
            boxShadow: `
              0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              0 0 15px rgba(99, 102, 241, 0.2),
              0 0 25px rgba(139, 92, 246, 0.1)
            `
          }}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div 
                className={`p-3 rounded-full ${
                  isDarkMode ? 'bg-white/10' : 'bg-white/50'
                } shadow-lg`}
                style={{
                  boxShadow: `
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    0 0 10px rgba(99, 102, 241, 0.3),
                    0 0 20px rgba(139, 92, 246, 0.2)
                  `
                }}
              >
                {icon}
              </div>
            </div>
            <h3 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm min-h-[60px] flex items-center justify-center">
              {content}
            </p>
          </div>
        </div>

        {/* Enhanced Progress Dots */}
        <div className="flex justify-center space-x-3 mb-6" aria-label="Progress indicator">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`transition-all duration-300 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full ${
                index === currentStep 
                  ? 'w-8 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg' 
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-indigo-400'
              }`}
              aria-current={index === currentStep ? 'true' : 'false'}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-4 mt-auto">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200/50 dark:border-gray-600/50"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">{isLastStep ? 'Get Started' : 'Next'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

AITeacherIntroduction.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AITeacherIntroduction;