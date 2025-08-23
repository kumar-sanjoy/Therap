import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaChartLine, FaTrophy, FaGraduationCap, FaStar, 
  FaArrowUp, FaArrowDown, FaEye, FaDownload, FaFilter, FaSearch,
  FaSort, FaSortUp, FaSortDown, FaUserGraduate, FaAward, FaBullseye,
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaSignOutAlt,
  FaChevronLeft, FaChevronRight, FaBook, FaLightbulb, FaRocket,
  FaSpinner, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';
import StudentDetailsModal from './StudentDetailsModal';
import '../css/TeacherMainDesign.css';
import flowLogo from '../assets/flow-main-nobg.png';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <FaUsers className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-lg" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Student Data</h3>
      <p className="text-gray-500">Please wait while we fetch your dashboard...</p>
    </div>
  </div>
);

// Performance indicator component
const PerformanceIndicator = ({ correct, total, size = "md" }) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const radius = size === "sm" ? 25 : size === "lg" ? 40 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (percent) => {
    if (percent >= 80) return "text-green-500 stroke-green-500";
    if (percent >= 50) return "text-blue-500 stroke-blue-500";
    return "text-red-500 stroke-red-500";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg 
        className={`transform -rotate-90 ${size === "sm" ? "w-12 h-12" : size === "lg" ? "w-20 h-20" : "w-16 h-16"}`}
        viewBox={`0 0 ${(radius + 10) * 2} ${(radius + 10) * 2}`}
      >
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${getColor(percentage)}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${getColor(percentage)} ${size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm"}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

// Student card component
const StudentCard = ({ student, onClick }) => {
  const percentage = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
  
  const getPerformanceLevel = (percent) => {
    if (percent >= 80) return { level: "excellent", color: "green", icon: FaTrophy };
    if (percent >= 50) return { level: "mediocre", color: "blue", icon: FaStar };
    return { level: "needs-improvement", color: "red", icon: FaLightbulb };
  };

  const performance = getPerformanceLevel(percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div 
      onClick={() => onClick(student.studentId)}
      className={`bg-white rounded-2xl shadow-lg border-2 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-6 
        ${performance.color === 'green' ? 'border-green-100 hover:border-green-300' : 
          performance.color === 'blue' ? 'border-blue-100 hover:border-blue-300' : 
          'border-red-100 hover:border-red-300'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${
            performance.color === 'green' ? 'bg-green-100' : 
            performance.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
          }`}>
            <FaUserGraduate className={`text-lg ${
              performance.color === 'green' ? 'text-green-600' : 
              performance.color === 'blue' ? 'text-blue-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{student.name || student.studentId}</h3>
            <p className="text-sm text-gray-500">Student ID: {student.studentId}</p>
          </div>
        </div>
        <div className={`p-2 rounded-full ${
          performance.color === 'green' ? 'bg-green-100' : 
          performance.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
        }`}>
          <PerformanceIcon className={`text-sm ${
            performance.color === 'green' ? 'text-green-600' : 
            performance.color === 'blue' ? 'text-blue-600' : 'text-red-600'
          }`} />
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-4">
        <PerformanceIndicator 
          correct={student.correctAnswers} 
          total={student.totalQuestions} 
          size="lg" 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{student.totalQuestions}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Questions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{student.correctAnswers}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Correct</p>
        </div>
      </div>

      {/* Performance Badge */}
      <div className={`text-center py-2 px-4 rounded-full text-sm font-medium ${
        performance.color === 'green' ? 'bg-green-100 text-green-700' : 
        performance.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
      }`}>
        {performance.level === 'excellent' ? 'Excellent Performance' :
         performance.level === 'mediocre' ? 'Mediocre Performance' : 'Needs Support'}
      </div>

      {/* View Details Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors duration-200 font-medium">
          <FaEye className="text-sm" />
          View Details
        </button>
      </div>
    </div>
  );
};

const TeacherMain = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [sortBy, setSortBy] = useState('studentId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dashboardData, setDashboardData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerformance, setFilterPerformance] = useState('all');

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
    if (role !== 'TEACHER') {
      if (role === 'STUDENT') {
        navigate('/main');
      } else {
        navigate('/login');
      }
      return;
    }
  }, [navigate]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Real API call for production
        let username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        if (!username) {
          navigate('/login');
          return;
        }

        const params = new URLSearchParams({ username: username });
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        console.log('🔍 [TEACHER DEBUG] Fetching teacher profile:', {
          username: username,
          endpoint: `${API_BASE_URL}${API_ENDPOINTS.TEACHER_PROFILE}?${params.toString()}`
        });
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEACHER_PROFILE}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Server responded with status ${response.status}`);
        }

        const data = await response.json();
        
        console.log('🔍 [TEACHER DEBUG] Teacher profile response:', data);
        
        if (data && data.students && Array.isArray(data.students)) {
          // Transform the API response to match our component's expected format
          const transformedStudents = data.students.map(student => ({
            studentId: student.name, // Using name as studentId
            name: student.name,
            totalQuestions: student.attemptCount,
            correctAnswers: student.correctCount,
            last10Performance: student.last10Performance || []
          }));
          
          setStudents(transformedStudents);
          setDashboardData(data);
        } else if (data === null || !data.students) {
          setStudents([]);
          setDashboardData(data);
        } else {
          throw new Error('Expected students array in response data');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Calculate dashboard statistics
  const dashboardStats = React.useMemo(() => {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        totalQuestions: 0,
        averageAccuracy: 0,
        highPerformers: 0,
        lowPerformers: 0
      };
    }

    const totalQuestions = students.reduce((sum, student) => sum + student.totalQuestions, 0);
    const totalCorrect = students.reduce((sum, student) => sum + student.correctAnswers, 0);
    const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    const highPerformers = students.filter(student => {
      const accuracy = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
      return accuracy >= 80;
    }).length;
    
    const mediumPerformers = students.filter(student => {
      const accuracy = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
      return accuracy >= 50 && accuracy < 80;
    }).length;
    
    const lowPerformers = students.filter(student => {
      const accuracy = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
      return accuracy < 50;
    }).length;

    return {
      totalStudents: students.length,
      totalQuestions,
      averageAccuracy,
      highPerformers,
      mediumPerformers,
      lowPerformers
    };
  }, [students]);

  // Filter and sort students
  const filteredAndSortedStudents = React.useMemo(() => {
    let filtered = [...students];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.studentId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Performance filter
    if (filterPerformance !== 'all') {
      filtered = filtered.filter(student => {
        const accuracy = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
        switch (filterPerformance) {
          case 'high': return accuracy >= 80;
          case 'medium': return accuracy >= 50 && accuracy < 80;
          case 'low': return accuracy < 50;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'studentId') {
        // Sort by name if available, otherwise by studentId
        const nameA = a.name || a.studentId.toString();
        const nameB = b.name || b.studentId.toString();
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'totalQuestions') {
        comparison = a.totalQuestions - b.totalQuestions;
      } else if (sortBy === 'performance') {
        const perfA = a.totalQuestions > 0 ? a.correctAnswers / a.totalQuestions : 0;
        const perfB = b.totalQuestions > 0 ? b.correctAnswers / b.totalQuestions : 0;
        comparison = perfA - perfB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [students, searchQuery, filterPerformance, sortBy, sortOrder]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key) => {
    if (sortBy !== key) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-indigo-600" /> : <FaSortDown className="text-indigo-600" />;
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    setError('');
    
    try {
      const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
      if (!username) {
        setError('User not logged in');
        return;
      }

      const params = new URLSearchParams({ username });
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEACHER_REPORT}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reportUrl) {
          window.open(data.reportUrl, '_blank');
        } else {
          alert('Report generated successfully!');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate report. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.message || 'Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img src={flowLogo} alt="FLOW Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-500">Manage and monitor student progress</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  // Clear all authentication data
                  localStorage.removeItem(STORAGE_KEYS.USER_ID);
                  localStorage.removeItem(STORAGE_KEYS.USERNAME);
                  localStorage.removeItem(STORAGE_KEYS.TOKEN);
                  localStorage.removeItem(STORAGE_KEYS.ROLE);
                  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                  navigate('/');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <FaUsers className="text-2xl text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalStudents}</p>
            <p className="text-sm text-gray-500 mt-1">Active learners</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Average Accuracy</h3>
              <FaBullseye className="text-2xl text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.averageAccuracy}%</p>
            <p className="text-sm text-gray-500 mt-1">Class average</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">High Performers</h3>
              <FaTrophy className="text-2xl text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.highPerformers}</p>
            <p className="text-sm text-gray-500 mt-1">80%+ accuracy</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Medium Performers</h3>
              <FaStar className="text-2xl text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.mediumPerformers}</p>
            <p className="text-sm text-gray-500 mt-1">50-79% accuracy</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Need Support</h3>
              <FaLightbulb className="text-2xl text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.lowPerformers}</p>
            <p className="text-sm text-gray-500 mt-1">Below 50% accuracy</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 text-lg mt-0.5" />
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-64"
                />
              </div>

              {/* Performance Filter */}
              <select
                value={filterPerformance}
                onChange={(e) => setFilterPerformance(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Performance Levels</option>
                <option value="high">High Performers (80%+)</option>
                <option value="medium">Medium Performers (50-80%)</option>
                <option value="low">Need Support (&lt;50%)</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('studentId')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  sortBy === 'studentId' 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Name {getSortIcon('studentId')}
              </button>
              <button
                onClick={() => handleSort('totalQuestions')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  sortBy === 'totalQuestions' 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Questions {getSortIcon('totalQuestions')}
              </button>
              <button
                onClick={() => handleSort('performance')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  sortBy === 'performance' 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Performance {getSortIcon('performance')}
              </button>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        {filteredAndSortedStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaInfoCircle className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {students.length === 0 ? 'No Student Data Available' : 'No Students Match Your Filters'}
              </h3>
              <p className="text-gray-500">
                {students.length === 0 
                  ? 'There are no students enrolled in your classes yet.' 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
            {students.length === 0 && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Refresh Data
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedStudents.map((student) => (
              <StudentCard
                key={student.studentId}
                student={student}
                onClick={setSelectedStudentId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudentId && (
        <StudentDetailsModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
};

export default TeacherMain;