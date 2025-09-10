import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaInfoCircle
} from 'react-icons/fa';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../../../config';
import StudentDetailsModal from '../StudentDetailsComponent/StudentDetailsModal';
import '../../../css/TeacherMainDesign.css';

// Import modular components
import Header from '../Common/Header';
import LoadingScreen from '../Common/LoadingScreen';
import ErrorDisplay from '../Common/ErrorDisplay';
import Controls from '../Common/Controls';
import EmptyState from '../Common/EmptyState';
import DashboardStats from '../Common/DashboardStats';
import StudentsGrid from '../FilteredStudentsComponent/StudentsGrid';
import StudentsTable from '../Common/StudentsTable';
import ViewToggle from '../Common/ViewToggle';

const TeacherMain = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [sortBy, setSortBy] = useState('studentId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dashboardData, setDashboardData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerformance, setFilterPerformance] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

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

  const handleCategoryClick = (category, title) => {
    navigate('/teacher/students', { state: { category, title } });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="teacher-dashboard min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-900 transition-colors duration-300">

      
      {/* Header */}
      <Header navigate={navigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Dashboard Stats */}
        <DashboardStats 
          stats={dashboardStats} 
          onCategoryClick={handleCategoryClick}
        />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <Controls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            filterPerformance={filterPerformance}
            setFilterPerformance={setFilterPerformance}
          />
          
          {/* View Toggle */}
          <ViewToggle 
            currentView={viewMode} 
            onViewChange={setViewMode} 
          />
        </div>

        {/* Students Display */}
        {filteredAndSortedStudents.length === 0 ? (
          <EmptyState
            icon={FaInfoCircle}
            title={students.length === 0 ? 'No Student Data Available' : 'No Students Match Your Filters'}
            message={students.length === 0 
              ? 'There are no students enrolled in your classes yet.' 
              : 'Try adjusting your search or filter criteria.'}
            showRefreshButton={students.length === 0}
            onRefreshClick={() => window.location.reload()}
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <StudentsGrid 
                students={filteredAndSortedStudents}
                onStudentClick={setSelectedStudentId}
              />
            ) : (
              <StudentsTable 
                students={filteredAndSortedStudents}
                onStudentClick={setSelectedStudentId}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            )}
          </>
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