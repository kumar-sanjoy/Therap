import React, { useState, useEffect } from 'react';
import { useDarkTheme } from '../Common/DarkThemeProvider';
import flowLogoLight from '../../assets/flow-main-nobg.png';
import flowLogoDark from '../../assets/flow-dark.png';

const FlowLoadingScreen = () => {
  const { isDarkMode } = useDarkTheme();
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');

  useEffect(() => {
    const stages = [
      'Initializing...',
      'Loading modules...',
      'Preparing dashboard...',
      'Almost ready...'
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        
        if (newProgress < 25) setLoadingStage(stages[0]);
        else if (newProgress < 50) setLoadingStage(stages[1]);
        else if (newProgress < 80) setLoadingStage(stages[2]);
        else setLoadingStage(stages[3]);
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating geometric shapes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full animate-bounce opacity-30 ${
              i % 3 === 0 ? 'bg-indigo-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-cyan-400'
            }`}
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="text-center max-w-lg mx-auto px-8 relative z-10">
        {/* Logo section */}
        <div className="mb-16 relative">
          <div className="relative inline-block">
            {/* Actual FLOW logo */}
            <img 
              src={isDarkMode ? flowLogoDark : flowLogoLight} 
              alt="FLOW Logo" 
              className="w-40 mx-auto mb-4 drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" 
            />
            
            {/* Glow effect */}
            <div className="absolute inset-0 w-40 h-40 mx-auto bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>

        {/* Loading animation - Modern pulsing dots */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1s'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Modern typography */}
        <div className="space-y-6 mb-12">
          <p className="text-slate-600 dark:text-gray-300 font-medium text-xl">
            Preparing your personalized learning environment
          </p>
        </div>

        {/* Modern progress bar */}
        <div className="space-y-4">
          <div className="w-80 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-slate-500 w-80 mx-auto">
            <span className="font-medium">{loadingStage}</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Subtle feature hints */}
        <div className="mt-16 text-slate-400 text-sm">
          <div className="flex justify-center space-x-8">
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-ping"></div>
              <span>AI-Powered</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <span>Personalized</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <span>Interactive</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-300/60 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.3; 
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(90deg); 
            opacity: 0.8; 
          }
          50% { 
            transform: translateY(-15px) translateX(-5px) rotate(180deg); 
            opacity: 1; 
          }
          75% { 
            transform: translateY(-25px) translateX(15px) rotate(270deg); 
            opacity: 0.8; 
          }
        }
      `}</style>
    </div>
  );
};

export default FlowLoadingScreen;
