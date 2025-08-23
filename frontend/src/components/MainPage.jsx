import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBook, FaPen, FaChevronLeft, FaChevronRight, FaUser, FaSignOutAlt, 
  FaQuestionCircle, FaStickyNote, FaHistory, FaFire, FaGraduationCap, 
  FaTrophy, FaStar, FaChartLine, FaBullseye, FaCheckCircle, FaTimesCircle,
  FaArrowUp, FaArrowDown, FaMinus, FaLightbulb, FaAward, FaRocket,
  FaClock, FaChartBar, FaRegSmile, FaRegFrown, FaRegMeh
} from 'react-icons/fa';
import { LuNotebookPen } from "react-icons/lu";
import { ImBooks } from "react-icons/im";
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, subject_map } from '../config';
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

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    
    if (!token || !username) {
      navigate('/login');
      return;
    }
    
    // Check if user has the correct role for this page
    if (role !== 'STUDENT') {
      if (role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/login');
      }
      return;
    }
  }, [navigate]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (!userId || !username || !token) {
          navigate('/login');
          return;
        }

        const params = new URLSearchParams({
          username: username
        });
        
        console.log('🔍 [MAIN_PAGE DEBUG] Fetching student profile with params:', {
          username,
          params: params.toString(),
          endpoint: `${API_BASE_URL}${API_ENDPOINTS.STUDENT_PROFILE}`,
          fullUrl: `${API_BASE_URL}${API_ENDPOINTS.STUDENT_PROFILE}?${params.toString()}`
        });
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_PROFILE}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log('🔍 [MAIN_PAGE DEBUG] API response status:', response.status);
        console.log('🔍 [MAIN_PAGE DEBUG] API response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          
          // Log the backend response
          console.log('🔍 [MAIN_PAGE DEBUG] Student profile response:', {
            rawResponse: data,
            responseType: typeof data,
            hasId: !!data.id,
            hasAttemptCount: !!data.attemptCount,
            hasCorrectCount: !!data.correctCount,
            hasLast10Performance: !!data.last10Performance,
            hasStreak: !!data.streak,
            last10PerformanceType: Array.isArray(data.last10Performance) ? 'array' : typeof data.last10Performance,
            last10PerformanceLength: Array.isArray(data.last10Performance) ? data.last10Performance.length : 'N/A'
          });
          
          // Log detailed breakdown
          console.log('🔍 [MAIN_PAGE DEBUG] Detailed response breakdown:', {
            id: data.id,
            attemptCount: data.attemptCount,
            correctCount: data.correctCount,
            last10Performance: data.last10Performance,
            streak: data.streak,
            calculatedAccuracy: data.attemptCount > 0 ? Math.round((data.correctCount / data.attemptCount) * 100) : 0
          });
          
          // Backend returns: { id, attemptCount, correctCount, last10Performance, streak }
          // Process subject progress from backend format
          const processedSubjects = {};
          if (data.subjectProgress && Array.isArray(data.subjectProgress)) {
            console.log('🔍 [MAIN_PAGE DEBUG] Processing subject progress:', data.subjectProgress);
            
            data.subjectProgress.forEach(([subjectCode, correctCount, attemptCount]) => {
              // Map subject code to readable name using the mapping from config
              let subjectName = 'Unknown';
              for (const [name, code] of Object.entries(subject_map)) {
                if (code === subjectCode) {
                  subjectName = name;
                  break;
                }
              }
              
              const accuracy = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
              processedSubjects[subjectName] = {
                completed: attemptCount,
                accuracy: accuracy,
                correctCount: correctCount
              };
              
              console.log('🔍 [MAIN_PAGE DEBUG] Mapped subject:', {
                subjectCode,
                subjectName,
                correctCount,
                attemptCount,
                accuracy
              });
            });
          }
          
          const processedStats = {
            totalQuestions: data.attemptCount,
            totalRight: data.correctCount,
            totalWrong: data.attemptCount - data.correctCount,
            lastTenPerformance: data.last10Performance.map(result => result ? 'right' : 'wrong'),
            streak: data.currentStreak || 0, // Use currentStreak from backend
            subjects: processedSubjects
          };
          
          console.log('🔍 [MAIN_PAGE DEBUG] Processed stats for frontend:', processedStats);
          
          setStats(processedStats);
          setIsLoading(false);
        } else {
          console.error('🔍 [MAIN_PAGE DEBUG] Failed to fetch stats, status:', response.status);
          const errorText = await response.text();
          console.error('🔍 [MAIN_PAGE DEBUG] Error response:', errorText);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
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
            <button onClick={() => navigate('/ask')} className="w-full p-4 flex items-center hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-300 rounded-xl transition-all duration-200 mb-2 group">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/40 transition-colors duration-200">
                <FaQuestionCircle className="text-lg text-cyan-600 dark:text-cyan-400" />
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
              {(() => {
                console.log('🔍 [MAIN_PAGE DEBUG] Rendering subjects:', {
                  subjectsObject: stats.subjects,
                  subjectsKeys: Object.keys(stats.subjects),
                  subjectsEntries: Object.entries(stats.subjects)
                });
                return Object.entries(stats.subjects).map(([subject, data]) => (
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
              ));
              })()}
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div className={`rounded-2xl shadow-lg border p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-gray-100' : 'text-[#343434]'
                }`}>Recent Performance</h2>
                {/* Performance trend indicator */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length >= 3
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 shadow-sm'
                    : stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length <= 1
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 shadow-sm'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 shadow-sm'
                }`}>
                  {stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length >= 3 ? (
                    <FaArrowUp className="text-green-600 dark:text-green-400" />
                  ) : stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length <= 1 ? (
                    <FaArrowDown className="text-red-600 dark:text-red-400" />
                  ) : (
                    <FaMinus className="text-yellow-600 dark:text-yellow-400" />
                  )}
                  {stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length >= 3 ? 'Improving' : 
                   stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length <= 1 ? 'Needs Focus' : 'Stable'}
                </div>
              </div>
              <FaHistory className="text-2xl text-indigo-500" />
            </div>

            {/* Performance Timeline */}
            <div className="space-y-6">


              {/* Visual Performance Chain */}
              <div className={`p-6 rounded-xl transition-all duration-300 ${
                isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/40' : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                
                {/* Desktop View - Horizontal Chain */}
                <div className="hidden md:flex items-center justify-between relative">
                  {stats.lastTenPerformance.map((result, index) => (
                    <div key={index} className="flex flex-col items-center group relative">
                      {/* Connection Line */}
                      {index < stats.lastTenPerformance.length - 1 && (
                        <div className={`absolute w-8 h-0.5 mt-6 ml-8 transition-all duration-300 ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                      )}
                      
                      {/* Question Circle */}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${
                        result === 'right' 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200 hover:shadow-emerald-300' 
                          : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-200 hover:shadow-red-300'
                      }`}>
                        {result === 'right' ? (
                          <FaCheckCircle className="text-lg" />
                        ) : (
                          <FaTimesCircle className="text-lg" />
                        )}
                      </div>
                      
                      {/* Question Number */}
                      <span className={`mt-2 text-xs font-medium transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'
                      }`}>
                        Q{index + 1}
                      </span>
                      
                      {/* Hover Tooltip */}
                      <div className={`absolute top-16 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-lg transform -translate-x-1/2 left-1/2`}>
                        <div className="flex items-center gap-2">
                          {result === 'right' ? (
                            <FaCheckCircle className="text-green-400" />
                          ) : (
                            <FaTimesCircle className="text-red-400" />
                          )}
                          <span>Question {index + 1}: {result === 'right' ? 'Correct' : 'Incorrect'}</span>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile View - Grid Layout */}
                <div className="grid grid-cols-5 gap-3 md:hidden">
                  {stats.lastTenPerformance.map((result, index) => (
                    <div key={index} className="flex flex-col items-center group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 group-hover:scale-105 ${
                        result === 'right' 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                          : 'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        {result === 'right' ? (
                          <FaCheckCircle className="text-sm" />
                        ) : (
                          <FaTimesCircle className="text-sm" />
                        )}
                      </div>
                      <span className={`mt-1 text-xs transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'
                      }`}>
                        Q{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Insights */}
              {(() => {
                const correctAnswers = stats.lastTenPerformance.filter(r => r === 'right').length;
                const streak = stats.streak;
                const recentTrend = stats.lastTenPerformance.slice(-5).filter(r => r === 'right').length;
                
                // Dynamic performance analysis
                let performanceLevel, emoji, title, message, borderColor, bgColor, textColor;
                
                // High performance scenarios
                if (correctAnswers >= 8 && streak >= 5) {
                  performanceLevel = 'excellent';
                  emoji = <FaTrophy className="text-2xl" />;
                  title = 'Outstanding Performance!';
                  message = `Amazing work! You've got ${correctAnswers}/10 correct and a ${streak}-day streak. You're on fire! 🔥`;
                } else if (correctAnswers >= 7 && streak >= 3) {
                  performanceLevel = 'great';
                  emoji = <FaAward className="text-2xl" />;
                  title = 'Great Performance!';
                  message = `Excellent progress! ${correctAnswers}/10 correct with a ${streak}-day streak. Keep this momentum going!`;
                } else if (correctAnswers >= 6 && recentTrend >= 3) {
                  performanceLevel = 'improving';
                  emoji = <FaArrowUp className="text-2xl" />;
                  title = 'Improving Well!';
                  message = `You're getting better! ${correctAnswers}/10 correct and improving in recent questions. Stay focused!`;
                }
                // Medium performance scenarios
                else if (correctAnswers >= 5 && streak >= 2) {
                  performanceLevel = 'stable';
                  emoji = <FaBook className="text-2xl" />;
                  title = 'Steady Progress';
                  message = `Good consistency! ${correctAnswers}/10 correct with a ${streak}-day streak. Keep practicing regularly.`;
                } else if (correctAnswers >= 4 && recentTrend >= 2) {
                  performanceLevel = 'stable';
                  emoji = <FaRegSmile className="text-2xl" />;
                  title = 'Making Progress';
                  message = `You're on the right track! ${correctAnswers}/10 correct. Focus on the areas you find challenging.`;
                }
                // Low performance scenarios
                else if (correctAnswers <= 2 && streak <= 1) {
                  performanceLevel = 'needs-focus';
                  emoji = <FaBullseye className="text-2xl" />;
                  title = 'Time to Focus';
                  message = `Let's turn this around! Only ${correctAnswers}/10 correct. Review the basics and try again. You've got this!`;
                } else if (correctAnswers <= 3 && recentTrend <= 1) {
                  performanceLevel = 'needs-focus';
                  emoji = <FaRegFrown className="text-2xl" />;
                  title = 'Needs Improvement';
                  message = `Only ${correctAnswers}/10 correct recently. Take a break, review the material, and come back stronger!`;
                }
                // Default scenarios
                else if (correctAnswers >= 4) {
                  performanceLevel = 'stable';
                  emoji = <FaRegMeh className="text-2xl" />;
                  title = 'Keep Learning';
                  message = `${correctAnswers}/10 correct. You're making progress! Focus on consistency and regular practice.`;
                } else {
                  performanceLevel = 'needs-focus';
                  emoji = <FaLightbulb className="text-2xl" />;
                  title = 'Room for Growth';
                  message = `${correctAnswers}/10 correct. Every expert was once a beginner. Keep practicing and don't give up!`;
                }
                
                // Set colors based on performance level
                switch (performanceLevel) {
                  case 'excellent':
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50 dark:bg-green-900/20';
                    textColor = 'text-green-700 dark:text-green-300';
                    break;
                  case 'great':
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50 dark:bg-green-900/20';
                    textColor = 'text-green-700 dark:text-green-300';
                    break;
                  case 'improving':
                    borderColor = 'border-blue-500';
                    bgColor = 'bg-blue-50 dark:bg-blue-900/20';
                    textColor = 'text-blue-700 dark:text-blue-300';
                    break;
                  case 'stable':
                    borderColor = 'border-yellow-500';
                    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
                    textColor = 'text-yellow-700 dark:text-yellow-300';
                    break;
                  case 'needs-focus':
                    borderColor = 'border-red-500';
                    bgColor = 'bg-red-50 dark:bg-red-900/20';
                    textColor = 'text-red-700 dark:text-red-300';
                    break;
                  default:
                    borderColor = 'border-gray-500';
                    bgColor = 'bg-gray-50 dark:bg-gray-900/20';
                    textColor = 'text-gray-700 dark:text-gray-300';
                }
                
                return (
                  <div className={`p-4 rounded-xl border-l-4 ${borderColor} ${bgColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{emoji}</div>
                      <div>
                        <h4 className={`font-semibold ${textColor}`}>
                          {title}
                        </h4>
                        <p className={`text-sm mt-1 ${textColor.replace('700', '600').replace('300', '400')}`}>
                          {message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;


