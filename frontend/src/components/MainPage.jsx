import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaPen, FaChevronLeft, FaChevronRight, FaUser, FaSignOutAlt, FaQuestionCircle, FaStickyNote, FaHistory, FaFire, FaGraduationCap, FaTrophy, FaStar, FaChartLine } from 'react-icons/fa';
import { LuNotebookPen } from "react-icons/lu";
import { ImBooks } from "react-icons/im";
import { API_BASE_URL, API_ENDPOINTS, DEV_MODE, STORAGE_KEYS } from '../config';
import ThemeToggle from './ThemeToggle';
import { useDarkTheme } from './DarkThemeProvider';
import flowLogoLight from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';

// FlowLoadingScreen Component
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
          {/* <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
            FLOW Learning Platform
          </h1> */}
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

const MainPage = () => {
  const { isDarkMode } = useDarkTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('sidebarOpen');
    return stored === null ? true : stored === 'true';
  });
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalRight: 0,
    totalWrong: 0,
    lastTenPerformance: [],
    streak: 0,
    subjects: {
      math: { completed: 15, accuracy: 85 },
      science: { completed: 12, accuracy: 78 },
      english: { completed: 8, accuracy: 92 }
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for development
  useEffect(() => {
    if (DEV_MODE) {
      setTimeout(() => {
        setStats({
          totalQuestions: 30,
          totalRight: 20,
          totalWrong: 10,
          lastTenPerformance: ['right', 'right', 'wrong', 'right', 'wrong', 'right', 'right', 'wrong', 'right', 'right'],
          streak: 5,
          subjects: {
            math: { completed: 15, accuracy: 85 },
            science: { completed: 12, accuracy: 78 },
            english: { completed: 8, accuracy: 92 }
          }
        });
        setIsLoading(false);
      }, 1000);
    } else {
      const fetchStats = async () => {
        try {
          const userName = localStorage.getItem(STORAGE_KEYS.USERNAME);
          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          
          console.log('🔍 Debug - userId:', userId);
          console.log('🔍 Debug - token:', token);
          
          if (!userName || !token) {
            console.log('🔍 Debug - Missing userId or token, redirecting to login');
            navigate('/login');
            return;
          }

          const params = new URLSearchParams({
            username: userId
          });
          
          console.log('🔍 Debug - API URL:', `${API_BASE_URL}${API_ENDPOINTS.STUDENT_PROFILE}?${params.toString()}`);
          console.log('🔍 Debug - Headers:', {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          });
          
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_PROFILE}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          console.log('🔍 Debug - Response status:', response.status);
          console.log('🔍 Debug - Response headers:', Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const data = await response.json();
            console.log('🔍 Debug - Backend response data:', data);
            
            // Backend returns: { id, attemptCount, correctCount, last10Performance }
            // Convert to frontend stats format
            const accuracy = data.attemptCount > 0 ? Math.round((data.correctCount / data.attemptCount) * 100) : 0;
            const streak = data.last10Performance ? data.last10Performance.filter(result => result).length : 0;
            
            setStats({
              totalQuestions: data.attemptCount,
              totalRight: data.correctCount,
              totalWrong: data.attemptCount - data.correctCount,
              lastTenPerformance: data.last10Performance.map(result => result ? 'right' : 'wrong'),
              streak: streak,
              subjects: {
                math: { completed: 15, accuracy: 85 },
                science: { completed: 12, accuracy: 78 },
                english: { completed: 8, accuracy: 92 }
              }
            });
            setIsLoading(false);
          } else {
            console.error('Failed to fetch stats');
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      };

      fetchStats();
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsLogoHovered(false);
  };

  const handleNavigation = (mode) => {
    navigate('/select', { state: { mode } });
  };

  const isMobile = window.innerWidth < 640;
  const sidebarOpen = isMobile ? isSidebarOpen : isSidebarOpen;
  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-20';
  const sidebarOverlay = isMobile && !sidebarOpen ? 'pointer-events-none opacity-0' : '';
  const sidebarHighlight = !isSidebarOpen && (isSidebarHovered || isLogoHovered) ? 'bg-gray-100 border-r-2 border-gray-300' : '';

  if (isLoading) {
    return <FlowLoadingScreen />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      isDarkMode 
        ? 'from-gray-900 via-gray-800 to-gray-900' 
        : 'from-gray-50 via-white to-blue-50'
    }`}>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarWidth} shadow-xl z-30 
          ${sidebarHighlight} ${sidebarOverlay} border-r ${
          isDarkMode 
            ? 'bg-gray-800 text-gray-100 border-gray-700' 
            : 'bg-white text-[#343434] border-gray-100'
        }`}
        onMouseEnter={() => !isSidebarOpen && setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        style={isMobile && !sidebarOpen ? { display: 'none' } : {}}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
          {/* Logo Container - now with hover effect */}
          <div 
            className={`flex items-center justify-center ${!isSidebarOpen ? 'hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl' : ''}`}
            onMouseEnter={() => !isSidebarOpen && setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            onClick={() => !isSidebarOpen && toggleSidebar()}
            style={{ 
              minHeight: '48px', 
              minWidth: '48px',
              transition: 'background-color 150ms ease-in-out'
            }}
          >
            {isSidebarOpen ? (
              <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="w-24 transition-all duration-300 ease-in-out" />
            ) : (
              isLogoHovered ? (
                <div className="p-2">
                  <FaChevronRight className="text-2xl text-gray-600 dark:text-gray-300" />
                </div>
              ) : (
                <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="w-20 transition-all duration-300 ease-in-out" />
              )
            )}
          </div>
          {/* Toggle button - only shown when sidebar is open */}
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <button 
                onClick={toggleSidebar} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-150"
              >
                <FaChevronLeft className="text-xl text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          )}
        </div>
        
        <nav className="mt-6 flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex-1 px-2">
            {/* Learning Section */}
            {isSidebarOpen && (
              <div className="px-4 py-2 mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Learning</h3>
              </div>
            )}
            <button onClick={() => handleNavigation('learn')} className="w-full p-4 flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-all duration-200 mb-2 group">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-200">
                <FaBook className="text-lg text-blue-600 dark:text-blue-400" />
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">Learn</span>}
            </button>
            <button onClick={() => handleNavigation('mcq')} className="w-full p-4 flex items-center hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 rounded-xl transition-all duration-200 mb-2 group">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg group-hover:bg-violet-200 dark:group-hover:bg-violet-800/40 transition-colors duration-200">
                <LuNotebookPen className="text-lg text-violet-600 dark:text-violet-400" />
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">Quiz</span>}
            </button>
            <button onClick={() => handleNavigation('written')} className="w-full p-4 flex items-center hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 rounded-xl transition-all duration-200 mb-2 group">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors duration-200">
                <FaPen className="text-lg text-green-600 dark:text-green-400" />
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">Written Practice</span>}
            </button>

            {/* Tools Section */}
            {isSidebarOpen && (
              <div className="px-4 py-2 mb-4 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tools</h3>
              </div>
            )}
            <button onClick={() => navigate('/note')} className="w-full p-4 flex items-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-700 dark:hover:text-yellow-300 rounded-xl transition-all duration-200 mb-2 group">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 transition-colors duration-200">
                <FaStickyNote className="text-lg text-yellow-600 dark:text-yellow-400" />
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">Notes</span>}
            </button>
            <button onClick={() => navigate('/select', { state: { mode: 'revise' } })} className="w-full p-4 flex items-center hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300 rounded-xl transition-all duration-200 mb-2 group">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors duration-200">
                <FaHistory className="text-lg text-orange-600 dark:text-orange-400" />
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">Revise</span>}
            </button>
            <button onClick={() => navigate('/ask')} className="w-full p-4 flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-all duration-200 mb-2 group">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-200">
                <FaQuestionCircle className="text-lg text-blue-600 dark:text-blue-400" />
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">Clear Doubt</span>}
            </button>
          </div>
          
          {/* Logout Section */}
          <div className="px-2">
            <button onClick={handleLogout} className="w-full p-4 flex items-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 border-t border-gray-100 dark:border-gray-700 rounded-xl group">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-200">
                <FaSignOutAlt className="text-lg text-red-600 dark:text-red-400" />
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 sm:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'} ${isMobile ? '!ml-0' : ''}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#343434] dark:text-gray-100 mb-2">Welcome back!</h1>
              <p className="text-gray-600 dark:text-gray-300">Ready to continue your learning journey?</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg text-white">
              <div className="flex items-center gap-2 mb-1">
                <FaFire className="text-yellow-300" />
                <span className="text-sm font-medium">Current Streak</span>
              </div>
              <p className="text-2xl font-bold">{stats.streak} days</p>
            </div>
          </div>



          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Questions</h3>
                <FaGraduationCap className="text-2xl text-emerald-500" />
              </div>
              <p className="text-4xl font-bold text-[#343434] dark:text-gray-100">{stats.totalQuestions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Questions attempted</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Correct Answers</h3>
                <FaTrophy className="text-2xl text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-green-600">{stats.totalRight}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Right answers</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Accuracy</h3>
                <FaStar className="text-2xl text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-blue-600">
                {stats.totalQuestions > 0 ? Math.round((stats.totalRight / stats.totalQuestions) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Success rate</p>
            </div>
          </div>

          {/* Subject Progress */}
          <div className={`rounded-2xl shadow-lg border p-6 mb-8 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-gray-100' : 'text-[#343434]'
              }`}>Subject Progress</h2>
              <FaChartLine className="text-2xl text-emerald-500" />
            </div>
            <div className="space-y-6">
              {Object.entries(stats.subjects).map(([subject, data]) => (
                <div key={subject} className={`flex items-center justify-between p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <h3 className={`font-semibold capitalize text-lg ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{subject}</h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{data.completed} questions completed</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-32 rounded-full h-3 ${
                      isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${data.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{data.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-2xl shadow-lg border p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-gray-100' : 'text-[#343434]'
              }`}>Recent Activity</h2>
              <FaHistory className="text-2xl text-indigo-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.lastTenPerformance.map((result, index) => (
                <div key={index} className={`flex flex-col items-center p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`w-4 h-4 rounded-full mb-2 ${result === 'right' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Q{index + 1}</span>
                  <span className={`text-xs font-semibold ${result === 'right' ? 'text-green-600' : 'text-red-600'}`}>
                    {result === 'right' ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;


