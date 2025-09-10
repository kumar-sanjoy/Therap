import React, { useState, useEffect } from 'react';
import { useDarkTheme } from '../Common/DarkThemeProvider';
import TeacherAvatar from '../Common/TeacherAvatar';
import TypewriterEffect from '../Common/TypewriterEffect';
import { AnimatedEntrance, FloatingParticles } from '../Common/AnimatedComponents';
import { 
  Sun, 
  Moon, 
  Coffee, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Star, 
  Zap,
  Sparkles,
  Heart
} from 'lucide-react';

const WelcomeGreeting = ({ stats, username }) => {
  const { isDarkMode } = useDarkTheme();
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [greetingType, setGreetingType] = useState('default');
  const [showGreeting, setShowGreeting] = useState(false);
  const [avatarMood, setAvatarMood] = useState('friendly');
  const [avatarStatus, setAvatarStatus] = useState('online');
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Day-specific greetings
    const dayGreetings = {
      0: "Happy Sunday", // Sunday
      1: "Happy Monday", // Monday
      2: "Happy Tuesday", // Tuesday
      3: "Happy Wednesday", // Wednesday
      4: "Happy Thursday", // Thursday
      5: "Happy Friday", // Friday
      6: "Happy Saturday" // Saturday
    };
    
    const dayGreeting = dayGreetings[dayOfWeek];
    
    if (hour < 12) return { text: `${dayGreeting}! Good morning`, icon: <Sun className="w-4 h-4" />, type: 'morning' };
    if (hour < 17) return { text: `${dayGreeting}! Good afternoon`, icon: <Coffee className="w-4 h-4" />, type: 'afternoon' };
    return { text: `${dayGreeting}! Good evening`, icon: <Moon className="w-4 h-4" />, type: 'evening' };
  };

  // Get performance-based greeting
  const getPerformanceGreeting = () => {
    if (!stats) return null;
    
    const accuracy = stats.totalQuestions > 0 ? (stats.totalRight / stats.totalQuestions) * 100 : 0;
    const streak = stats.streak || 0;
    
    if (accuracy >= 90) {
      return {
        text: "You're absolutely crushing it! 🌟",
        icon: <Star className="w-4 h-4" />,
        type: 'excellent',
        mood: 'excited'
      };
    } else if (accuracy >= 75) {
      return {
        text: "You're doing fantastic! Keep it up! 💪",
        icon: <TrendingUp className="w-4 h-4" />,
        type: 'good',
        mood: 'encouraging'
      };
    } else if (streak >= 5) {
      return {
        text: `Amazing ${streak}-day streak! You're on fire! 🔥`,
        icon: <Zap className="w-4 h-4" />,
        type: 'streak',
        mood: 'excited'
      };
    } else if (stats.totalQuestions > 50) {
      return {
        text: "You've been working hard! That's impressive! 📚",
        icon: <BookOpen className="w-4 h-4" />,
        type: 'dedicated',
        mood: 'encouraging'
      };
    }
    
    return null;
  };

  // Get motivational greeting
  const getMotivationalGreeting = () => {
    const motivationalMessages = [
      {
        text: "Ready to learn something amazing today? 🚀",
        icon: <Sparkles className="w-4 h-4" />,
        type: 'motivational',
        mood: 'friendly'
      },
      {
        text: "Your potential is limitless! Let's unlock it together! 🔓",
        icon: <Target className="w-4 h-4" />,
        type: 'motivational',
        mood: 'encouraging'
      },
      {
        text: "Every question is a step toward greatness! 🌟",
        icon: <Heart className="w-4 h-4" />,
        type: 'motivational',
        mood: 'friendly'
      },
      {
        text: "Today is your day to shine! ✨",
        icon: <Star className="w-4 h-4" />,
        type: 'motivational',
        mood: 'excited'
      },
      {
        text: "Let's make today count! Every moment of learning matters! ⏰",
        icon: <Target className="w-4 h-4" />,
        type: 'motivational',
        mood: 'encouraging'
      },
      {
        text: "You're building an amazing future with every study session! 🏗️",
        icon: <Sparkles className="w-4 h-4" />,
        type: 'motivational',
        mood: 'friendly'
      }
    ];
    
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  };

  // Generate dynamic greeting
  const generateGreeting = () => {
    const timeGreeting = getTimeBasedGreeting();
    const performanceGreeting = getPerformanceGreeting();
    const motivationalGreeting = getMotivationalGreeting();
    
    // Check if this is the first visit today
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisitDate');
    const isFirstVisitToday = lastVisit !== today;
    
    if (isFirstVisitToday) {
      localStorage.setItem('lastVisitDate', today);
      setIsFirstVisit(true);
    }
    
    // Priority: first visit > performance > time-based > motivational
    let selectedGreeting;
    
    if (isFirstVisitToday && !stats?.totalQuestions) {
      // First-time user
      selectedGreeting = {
        text: "Welcome to your learning journey! I'm excited to help you grow! 🌱",
        icon: <Sparkles className="w-4 h-4" />,
        type: 'first-visit',
        mood: 'excited'
      };
    } else if (isFirstVisitToday) {
      // Returning user, first visit today
      selectedGreeting = {
        text: "Welcome back! Let's continue your amazing progress! 🎯",
        icon: <Heart className="w-4 h-4" />,
        type: 'returning',
        mood: 'excited'
      };
    } else {
      selectedGreeting = performanceGreeting || timeGreeting || motivationalGreeting;
    }
    
    // Add username if available
    const greetingText = username 
      ? `${selectedGreeting.text}, ${username}!`
      : selectedGreeting.text;
    
    setCurrentGreeting(greetingText);
    setGreetingType(selectedGreeting.type);
    setAvatarMood(selectedGreeting.mood || 'friendly');
    
    // Set avatar status based on greeting type
    if (selectedGreeting.type === 'excellent' || selectedGreeting.type === 'streak' || 
        selectedGreeting.type === 'first-visit' || selectedGreeting.type === 'returning') {
      setAvatarStatus('speaking');
    } else if (selectedGreeting.type === 'good' || selectedGreeting.type === 'dedicated') {
      setAvatarStatus('thinking');
    } else {
      setAvatarStatus('online');
    }
  };

  // Show greeting with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true);
      generateGreeting();
    }, 500);

    return () => clearTimeout(timer);
  }, [stats, username]);

  // Reset avatar status after greeting
  useEffect(() => {
    if (showGreeting && greetingType) {
      const timer = setTimeout(() => {
        setAvatarStatus('online');
        setAvatarMood('friendly');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showGreeting, greetingType]);

  if (!showGreeting) {
    return null;
  }

  return (
    <AnimatedEntrance direction="up" delay={200}>
      <div className={`relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900/95 via-slate-800/95 to-gray-900/95 border border-slate-700/50 shadow-2xl' 
          : 'bg-gradient-to-br from-white/95 via-slate-50/95 to-indigo-50/95 border border-slate-200/50 shadow-2xl'
      } backdrop-blur-lg`} style={{
        borderRadius: '200px 16px 16px 200px',
        padding: '16px 24px 16px 16px'
      }}>
        
        {/* Professional Animated Background Layers */}
        
        {/* Base Gradient Layer */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${
            isDarkMode 
              ? 'from-blue-900/10 via-indigo-900/5 to-purple-900/10' 
              : 'from-blue-500/15 via-indigo-500/8 to-purple-500/12'
          }`} style={{ borderRadius: '200px 16px 16px 200px' }}></div>
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path 
                  d="M 20 0 L 0 0 0 20" 
                  fill="none" 
                  stroke={isDarkMode ? "#475569" : "#64748b"} 
                  strokeWidth={isDarkMode ? "0.5" : "0.8"}
                  opacity={isDarkMode ? "0.3" : "0.6"}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Flowing Gradient Shapes */}
        <div className="absolute inset-0">
          {/* Main flowing orb */}
          <div className={`absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600/15 to-indigo-600/15' 
              : 'bg-gradient-to-r from-blue-400/25 to-indigo-400/20'
          }`} 
          style={{
            transform: 'translateY(-50%)',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          
          {/* Secondary flowing orb */}
          <div className={`absolute bottom-1/4 left-1/3 w-24 h-24 rounded-full blur-xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-indigo-600/12 to-purple-600/12' 
              : 'bg-gradient-to-r from-indigo-400/20 to-purple-400/18'
          }`} 
          style={{
            animation: 'float 8s ease-in-out infinite reverse'
          }}></div>
          
          {/* Tertiary accent orb */}
          <div className={`absolute top-1/4 left-1/2 w-16 h-16 rounded-full blur-lg ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-600/10 to-pink-600/10' 
              : 'bg-gradient-to-r from-purple-400/15 to-pink-400/12'
          }`} 
          style={{
            animation: 'float 10s ease-in-out infinite'
          }}></div>
        </div>

        {/* Subtle Animated Lines */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity="0"/>
                <stop offset="50%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity={isDarkMode ? "0.1" : "0.25"}/>
                <stop offset="100%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isDarkMode ? "#8b5cf6" : "#a78bfa"} stopOpacity="0"/>
                <stop offset="50%" stopColor={isDarkMode ? "#8b5cf6" : "#a78bfa"} stopOpacity={isDarkMode ? "0.08" : "0.2"}/>
                <stop offset="100%" stopColor={isDarkMode ? "#8b5cf6" : "#a78bfa"} stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {/* Animated diagonal lines */}
            <path 
              d="M0,40 Q50,20 100,40 T200,40" 
              stroke="url(#lineGradient1)" 
              strokeWidth={isDarkMode ? "2" : "3"} 
              fill="none"
              style={{
                animation: 'drawLine 4s ease-in-out infinite'
              }}
            />
            <path 
              d="M0,80 Q60,60 120,80 T240,80" 
              stroke="url(#lineGradient2)" 
              strokeWidth={isDarkMode ? "1.5" : "2.5"} 
              fill="none"
              style={{
                animation: 'drawLine 6s ease-in-out infinite reverse'
              }}
            />
          </svg>
        </div>

        {/* Professional Particle System */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                isDarkMode ? 'bg-blue-400/20' : 'bg-blue-500/35'
              }`}
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + Math.sin(i) * 30}%`,
                animation: `particleFloat ${3 + (i * 0.5)}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>

        {/* Geometric Accent Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top right accent */}
          <div className="absolute top-4 right-8">
            <div className={`w-3 h-3 border border-current ${
              isDarkMode ? 'opacity-20 text-blue-400' : 'opacity-40 text-blue-500'
            }`} 
            style={{
              transform: 'rotate(45deg)',
              animation: 'spin 20s linear infinite'
            }}></div>
          </div>
          
          {/* Bottom left accent */}
          <div className="absolute bottom-6 left-12">
            <div className={`w-2 h-2 rounded-full ${
              isDarkMode ? 'bg-indigo-400/20' : 'bg-indigo-500/30'
            }`} 
            style={{
              animation: 'pulse 3s ease-in-out infinite'
            }}></div>
          </div>
          
          {/* Middle accent line */}
          <div className="absolute top-1/2 right-6" style={{ transform: 'translateY(-50%)' }}>
            <div className={`w-8 h-px ${
              isDarkMode ? 'bg-purple-400/15' : 'bg-purple-500/25'
            }`} 
            style={{
              animation: 'fadeInOut 4s ease-in-out infinite'
            }}></div>
          </div>
          
          {/* Additional accent circles for light mode visibility */}
          <div className="absolute top-6 left-24">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isDarkMode ? 'bg-cyan-400/15' : 'bg-cyan-500/25'
            }`} 
            style={{
              animation: 'particleFloat 5s ease-in-out infinite'
            }}></div>
          </div>
          
          <div className="absolute bottom-8 right-16">
            <div className={`w-1 h-1 rounded-full ${
              isDarkMode ? 'bg-pink-400/15' : 'bg-pink-500/25'
            }`} 
            style={{
              animation: 'fadeInOut 3s ease-in-out infinite'
            }}></div>
          </div>
        </div>

        {/* Enhanced Floating Particles */}
        <FloatingParticles count={6} color={isDarkMode ? "blue" : "indigo"} />
        
        <div className="relative z-10 flex items-center">
          {/* Enhanced Teacher Avatar - Left Side */}
          <div className="flex-shrink-0 relative group mr-4">
            {/* Professional Avatar Glow Effect */}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${
              isDarkMode ? 'bg-blue-500' : 'bg-blue-400'
            }`}></div>
            
            <div className={`relative w-24 h-24 border-4 rounded-full overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800 shadow-2xl border-slate-600/50' 
                : 'bg-white shadow-2xl border-slate-200/50'
            } transform group-hover:scale-105 transition-all duration-300`}>
              <img 
                src="/src/assets/teacher.jpg" 
                alt="Your AI Teacher" 
                className="w-full h-full object-cover"
              />
              
              {/* Avatar overlay effect */}
              <div className={`absolute inset-0 ${
                isDarkMode 
                  ? 'bg-gradient-to-t from-gray-900/20 to-transparent' 
                  : 'bg-gradient-to-t from-white/10 to-transparent'
              }`}></div>
            </div>
          </div>
          
          {/* Enhanced Greeting Content - Right Side */}
          <div className="flex-1 min-w-0 flex items-center">
            {/* Greeting with Icon and Message */}
            <div className="flex items-center gap-3">
              {/* Professional Greeting Icon */}
              <div className={`p-3 rounded-xl shadow-lg flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30' 
                  : 'bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/30'
              } backdrop-blur-sm`}>
                {greetingType === 'morning' && <Sun className="w-5 h-5 text-amber-500" />}
                {greetingType === 'afternoon' && <Coffee className="w-5 h-5 text-orange-500" />}
                {greetingType === 'evening' && <Moon className="w-5 h-5 text-blue-500" />}
                {greetingType === 'excellent' && <Star className="w-5 h-5 text-yellow-500" />}
                {greetingType === 'good' && <TrendingUp className="w-5 h-5 text-green-500" />}
                {greetingType === 'streak' && <Zap className="w-5 h-5 text-yellow-500" />}
                {greetingType === 'dedicated' && <BookOpen className="w-5 h-5 text-blue-500" />}
                {greetingType === 'motivational' && <Sparkles className="w-5 h-5 text-purple-500" />}
                {greetingType === 'first-visit' && <Sparkles className="w-5 h-5 text-purple-500" />}
                {greetingType === 'returning' && <Heart className="w-5 h-5 text-red-500" />}
              </div>
              
              {/* Greeting Message */}
              <div className={`text-lg font-semibold ${
                isDarkMode ? 'text-slate-100' : 'text-slate-900'
              }`}>
                <TypewriterEffect
                  text={currentGreeting}
                  speed={50}
                  delay={300}
                  className="leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CSS Keyframes for Animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-10px) translateX(5px); }
            50% { transform: translateY(-5px) translateX(-5px); }
            75% { transform: translateY(-15px) translateX(3px); }
          }
          
          @keyframes particleFloat {
            0%, 100% { transform: translateY(0px) scale(1); opacity: ${isDarkMode ? '0.3' : '0.4'}; }
            50% { transform: translateY(-20px) scale(1.2); opacity: ${isDarkMode ? '0.7' : '0.8'}; }
          }
          
          @keyframes drawLine {
            0%, 100% { stroke-dasharray: 0, 100; }
            50% { stroke-dasharray: 50, 0; }
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: ${isDarkMode ? '0.1' : '0.2'}; }
            50% { opacity: ${isDarkMode ? '0.3' : '0.5'}; }
          }
        `}</style>
      </div>
    </AnimatedEntrance>
  );
};

export default WelcomeGreeting;