import React, { useState, useEffect } from 'react';
import { useDarkTheme } from './DarkThemeProvider';
import { MessageCircle, Sparkles, Volume2 } from 'lucide-react';
import teacherImage from '../../assets/teacher.jpg';

const TeacherAvatar = ({ 
  size = 'medium', 
  position = 'bottom-right',
  showName = true,
  className = '',
  onClick = null,
  isInteractive = false,
  status = 'online', // online, offline, thinking, speaking
  notificationCount = 0,
  showTooltip = false,
  avatarStyle = 'default', // default, minimal, detailed
  mood = 'friendly', // friendly, encouraging, thinking, excited
  customMessage = null // Custom message to display instead of default status message
}) => {
  const { isDarkMode } = useDarkTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Simulate thinking animation
  useEffect(() => {
    if (status === 'thinking') {
      const interval = setInterval(() => {
        setIsAnimating(prev => !prev);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Show pulse for notifications
  useEffect(() => {
    if (notificationCount > 0) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationCount]);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xlarge: 'w-24 h-24'
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'center-bottom': 'bottom-20 left-1/2 transform -translate-x-1/2'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    thinking: 'bg-blue-500',
    speaking: 'bg-purple-500'
  };

  const moodStyles = {
    friendly: 'hover:scale-105',
    encouraging: 'hover:scale-110 hover:rotate-1',
    thinking: 'animate-pulse',
    excited: 'hover:scale-110 hover:-rotate-1'
  };

  const interactiveClasses = isInteractive 
    ? `cursor-pointer ${moodStyles[mood]} transition-all duration-300 hover:shadow-2xl` 
    : '';

  const getAvatarBorder = () => {
    const baseClasses = "border-4 rounded-full overflow-hidden";
    
    if (isDarkMode) {
      switch (status) {
        case 'online':
          return `${baseClasses} border-green-600 bg-gray-800 shadow-lg shadow-green-900/30`;
        case 'thinking':
          return `${baseClasses} border-blue-600 bg-gray-800 shadow-lg shadow-blue-900/30 ${isAnimating ? 'border-blue-400' : ''}`;
        case 'speaking':
          return `${baseClasses} border-purple-600 bg-gray-800 shadow-lg shadow-purple-900/30`;
        default:
          return `${baseClasses} border-gray-600 bg-gray-800 shadow-xl`;
      }
    } else {
      switch (status) {
        case 'online':
          return `${baseClasses} border-green-200 bg-white shadow-lg shadow-green-100`;
        case 'thinking':
          return `${baseClasses} border-blue-200 bg-white shadow-lg shadow-blue-100 ${isAnimating ? 'border-blue-400' : ''}`;
        case 'speaking':
          return `${baseClasses} border-purple-200 bg-white shadow-lg shadow-purple-100`;
        default:
          return `${baseClasses} border-gray-200 bg-white shadow-xl`;
      }
    }
  };

  const getStatusMessage = () => {
    // Use custom message if provided
    if (customMessage) {
      return customMessage;
    }
    
    // Otherwise use default status messages
    switch (status) {
      case 'online': return 'Ready to help!';
      case 'thinking': return 'Thinking...';
      case 'speaking': return 'Speaking...';
      default: return 'AI Teacher';
    }
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-40 ${className}`}
      onClick={onClick}
    >
      <div className={`relative ${interactiveClasses} group`}>
        {/* Main Avatar */}
        <div className={`${sizeClasses[size]} ${getAvatarBorder()} relative`}>
          <img 
            src={teacherImage} 
            alt="Your AI Teacher" 
            className="w-full h-full object-cover"
          />
          

        </div>
        
        {/* Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColors[status]} rounded-full border-2 ${
          isDarkMode ? 'border-gray-800' : 'border-white'
        } shadow-sm`}>
          {status === 'speaking' && (
            <Volume2 className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
        
        {/* Notification Badge */}
        {notificationCount > 0 && (
          <div className={`absolute -top-2 -right-2 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium border-2 ${
            isDarkMode ? 'border-gray-800' : 'border-white'
          } shadow-lg ${showPulse ? 'animate-bounce' : ''}`}>
            {notificationCount > 99 ? '99+' : notificationCount}
          </div>
        )}
        
        {/* Interactive Indicator */}
        {isInteractive && (
          <div className={`absolute -top-2 -left-2 w-6 h-6 ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
          } rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* Name/Status Label */}
        {showName && (
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className={`text-xs font-medium ${
              isDarkMode 
                ? 'bg-gray-800/95 backdrop-blur-sm text-gray-200 border-gray-600' 
                : 'bg-white/95 backdrop-blur-sm text-gray-700 border-gray-200/50'
            } px-3 py-2 rounded-xl shadow-lg border group-hover:${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } transition-all`}>
              {getStatusMessage()}
            </div>
          </div>
        )}
        
        {/* Tooltip on Hover */}
        {showTooltip && isInteractive && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className={`${
              isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-900 text-white'
            } text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap`}>
              Click to chat with your AI teacher!
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-900'
              } rotate-45`}></div>
            </div>
          </div>
        )}
        
        {/* Floating particles effect for excited mood */}
        {mood === 'excited' && isInteractive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -top-2 right-2 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1 -left-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAvatar;
