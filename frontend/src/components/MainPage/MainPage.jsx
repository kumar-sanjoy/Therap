import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, subject_map } from '../../config';
import { useDarkTheme } from '../Common/DarkThemeProvider';
import FlowLoadingScreen from './FlowLoadingScreen';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsGrid from './StatsGrid';
import SubjectProgress from './SubjectProgress';
import RecentActivity from './RecentActivity';
import WelcomeGreeting from './WelcomeGreeting';

const MainPage = () => {
  const { isDarkMode } = useDarkTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('sidebarOpen');
    return stored === null ? true : stored === 'true';
  });
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
          }
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
  };

  const handleNavigation = (mode) => {
    navigate('/select', { state: { mode } });
  };

  const isMobile = window.innerWidth < 640;
  const sidebarOpen = isMobile ? isSidebarOpen : isSidebarOpen;
  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-20';
  const sidebarOverlay = isMobile && !sidebarOpen ? 'pointer-events-none opacity-0' : '';

  if (isLoading) {
    return <FlowLoadingScreen />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      isDarkMode 
        ? 'from-gray-900 via-gray-800 to-gray-900' 
        : 'from-gray-50 via-white to-blue-50'
    }`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        sidebarWidth={sidebarWidth}
        sidebarOverlay={sidebarOverlay}
        isDarkMode={isDarkMode}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        handleNavigation={handleNavigation}
        handleLogout={handleLogout}
        navigate={navigate}
      />

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
          {/* Welcome Greeting and Streak Section - Side by Side */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
            {/* Welcome Greeting Section */}
            <div className="flex-1">
              <WelcomeGreeting 
                stats={stats} 
                username={localStorage.getItem(STORAGE_KEYS.USERNAME)}
              />
            </div>
            
            {/* Streak Section - Positioned to align with greeting content */}
            <div className="lg:flex-shrink-0 lg:flex lg:items-center" style={{ 
              minHeight: '120px',
              marginTop: '16px'
            }}>
              <Header stats={stats} />
            </div>
          </div>
          
          <StatsGrid stats={stats} />
          <SubjectProgress stats={stats} isDarkMode={isDarkMode} />
          <RecentActivity stats={stats} isDarkMode={isDarkMode} />
        </div>
      </div>
 
    </div>
  );
};

export default MainPage;
