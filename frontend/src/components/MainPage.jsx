import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaQuestionCircle, FaStickyNote, FaHistory, FaChartLine, FaSignOutAlt, FaBars, FaPen } from 'react-icons/fa';
import { LuNotebookPen } from "react-icons/lu";
import flowLogo from '../assets/flow-main-nobg.png';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';

const MainPage = () => {
  const DEV_MODE = true;
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
          const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
          if (!userId) {
            navigate('/login');
            return;
          }

          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STATS}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          });

          if (response.ok) {
            const data = await response.json();
            setStats(data);
          } else {
            console.error('Failed to fetch stats');
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      };

      fetchStats();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (mode) => {
    navigate('/select', { state: { mode } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <img 
            src={flowLogo} 
            alt="FLOW Logo" 
            className="w-32 mb-8" 
          />
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 text-[#343434] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} shadow-lg`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <img src={flowLogo} alt="FLOW Logo" className={`${isSidebarOpen ? 'w-24' : 'w-8'} transition-all duration-300`} />
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-200 rounded-lg">
            <FaBars />
          </button>
        </div>
        
        <nav className="mt-8 flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex-1">
            <button onClick={() => handleNavigation('learn')} className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors">
              <FaBook className="text-xl" />
              {isSidebarOpen && <span className="ml-4">Learn</span>}
            </button>
            <button onClick={() => handleNavigation('mcq')} className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors">
              <LuNotebookPen className="text-xl" />
              {isSidebarOpen && <span className="ml-4">Quiz</span>}
            </button>
            <button onClick={() => handleNavigation('written')} className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors">
              <FaPen className="text-xl" />
              {isSidebarOpen && <span className="ml-4">Written Practice</span>}
            </button>
            <button onClick={() => navigate('/note')} className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors">
              <FaStickyNote className="text-xl" />
              {isSidebarOpen && <span className="ml-4">Notes</span>}
            </button>
            <button onClick={() => navigate('/prev')} className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors">
              <FaHistory className="text-xl" />
              {isSidebarOpen && <span className="ml-4">Revise</span>}
            </button>
            <button onClick={() => navigate('/ask')} className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors">
              <FaQuestionCircle className="text-xl" />
              {isSidebarOpen && <span className="ml-4">Clear Doubt</span>}
            </button>
          </div>
          <button onClick={handleLogout} className="w-full p-4 flex items-center hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100">
            <FaSignOutAlt className="text-xl" />
            {isSidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#343434]">Welcome back!</h1>
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="text-sm text-gray-500">Current Streak</span>
                <p className="text-2xl font-bold text-[#343434]">{stats.streak} days 🔥</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Questions</h3>
              <p className="text-3xl font-bold text-[#343434]">{stats.totalQuestions}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Correct Answers</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalRight}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Accuracy</h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalQuestions > 0 ? Math.round((stats.totalRight / stats.totalQuestions) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Subject Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-[#343434] mb-4">Subject Progress</h2>
            <div className="space-y-4">
              {Object.entries(stats.subjects).map(([subject, data]) => (
                <div key={subject} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold capitalize">{subject}</h3>
                    <p className="text-sm text-gray-500">{data.completed} questions completed</p>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#343434] h-2.5 rounded-full"
                      style={{ width: `${data.accuracy}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{data.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#343434] mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {stats.lastTenPerformance.map((result, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${result === 'right' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600">Question {index + 1}</span>
                  <span className={`font-semibold ${result === 'right' ? 'text-green-600' : 'text-red-600'}`}>
                    {result === 'right' ? 'Correct' : 'Incorrect'}
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


