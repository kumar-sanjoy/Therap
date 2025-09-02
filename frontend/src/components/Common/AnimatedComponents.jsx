import React, { useState, useEffect } from 'react';
import { useDarkTheme } from './DarkThemeProvider';

// Floating particles animation
export const FloatingParticles = ({ count = 8, color = 'indigo' }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 5 + 5,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full bg-${color}-400/20 animate-float`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.y}%`,
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  );
};

// Animated progress bar
export const AnimatedProgressBar = ({ progress = 0, duration = 2000, color = 'indigo' }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
      <div
        className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${animatedProgress}%` }}
      />
    </div>
  );
};

// Animated success checkmark
export const AnimatedCheckmark = ({ size = 'medium', delay = 0 }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg
        className="w-full h-full text-green-500 animate-checkmark"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ animationDelay: `${delay}ms` }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
};

// Animated card with hover effects
export const AnimatedCard = ({ children, className = '', hoverEffect = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`transition-all duration-300 ease-out transform ${
        hoverEffect && isHovered ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// Animated button with ripple effect
export const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false 
}) => {
  const [ripples, setRipples] = useState([]);
  const { isDarkMode } = useDarkTheme();

  const handleClick = (e) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = { x, y, size, id: Date.now() };

    setRipples(prev => [...prev, ripple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  const baseClasses = 'relative overflow-hidden transition-all duration-200 font-medium rounded-lg';
  const variantClasses = {
    primary: isDarkMode 
      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl' 
      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl',
    secondary: isDarkMode 
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    success: isDarkMode 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
    </button>
  );
};

// Animated typing indicator with dots
export const AnimatedTypingDots = ({ color = 'indigo', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  return (
    <div className="flex space-x-1">
      {[0, 150, 300].map((delay) => (
        <div
          key={delay}
          className={`${sizeClasses[size]} bg-${color}-500 rounded-full animate-bounce`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
};

// Animated entrance for components
export const AnimatedEntrance = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  duration = 500 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8'
  };

  return (
    <div
      className={`transition-all duration-${duration} ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 translate-x-0' 
          : `opacity-0 ${directionClasses[direction]}`
      }`}
    >
      {children}
    </div>
  );
};

// Animated pulse ring
export const AnimatedPulseRing = ({ size = 'medium', color = 'indigo' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 rounded-full bg-${color}-400 animate-ping opacity-20`} />
      <div className={`absolute inset-0 rounded-full bg-${color}-500 animate-pulse`} />
    </div>
  );
};

// Animated gradient background
export const AnimatedGradientBackground = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 animate-gradient-reverse" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default {
  FloatingParticles,
  AnimatedProgressBar,
  AnimatedCheckmark,
  AnimatedCard,
  AnimatedButton,
  AnimatedTypingDots,
  AnimatedEntrance,
  AnimatedPulseRing,
  AnimatedGradientBackground
};
