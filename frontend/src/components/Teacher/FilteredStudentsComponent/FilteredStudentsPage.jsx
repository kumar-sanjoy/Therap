import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUsers, FaTrophy, FaStar, FaLightbulb, FaInfoCircle
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
import CategoryHeader from './CategoryHeader';
import StudentsGrid from './StudentsGrid';

const FilteredStudentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [sortBy, setSortBy] = useState('studentId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Get category from URL params
  const category = location.state?.category || 'all';
  const categoryTitle = location.state?.title || 'All Students';

  // Category configuration
  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'high':
        return {
          title: 'High Performers',
          description: 'Students with 80%+ accuracy',
          icon: FaTrophy,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'medium':
        return {
          title: 'Medium Performers',
          description: 'Students with 50-79% accuracy',
          icon: FaStar,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'low':
        return {
          title: 'Students Needing Support',
          description: 'Students with below 50% accuracy',
          icon: FaLightbulb,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'all':
        return {
          title: 'All Students',
          description: 'Complete student list',
          icon: FaUsers,
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200'
        };
      default:
        return {
          title: 'Students',
          description: 'Student list',
          icon: FaUsers,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const categoryConfig = getCategoryConfig(category);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    
    if (!token || !username) {
      navigate('/login');
      return;
    }
    
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
          const transformedStudents = data.students.map(student => ({
            studentId: student.name,
            name: student.name,
            totalQuestions: student.attemptCount,
            correctAnswers: student.correctCount,
            last10Performance: student.last10Performance || []
          }));
          
          // Filter students based on category
          let filteredStudents = transformedStudents;
          if (category !== 'all') {
            filteredStudents = transformedStudents.filter(student => {
              const accuracy = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
              switch (category) {
                case 'high': return accuracy >= 80;
                case 'medium': return accuracy >= 50 && accuracy < 80;
                case 'low': return accuracy < 50;
                default: return true;
              }
            });
          }
          
          setStudents(filteredStudents);
        } else if (data === null || !data.students) {
          setStudents([]);
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
  }, [navigate, category]);

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

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'studentId') {
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
  }, [students, searchQuery, sortBy, sortOrder]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen 
        title="Loading Students" 
        message="Please wait while we fetch the data..." 
      />
    );
  }

  return (
    <div className="teacher-dashboard min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <Header 
        title={categoryConfig.title}
        subtitle={categoryConfig.description}
        showBackButton={true}
        onBackClick={() => navigate('/teacher')}
        navigate={navigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Category Header */}
        <CategoryHeader 
          categoryConfig={categoryConfig} 
          studentCount={filteredAndSortedStudents.length} 
        />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Controls */}
        <Controls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          searchPlaceholder={`Search ${categoryConfig.title.toLowerCase()}...`}
          showPerformanceFilter={false}
        />

        {/* Students Grid */}
        {filteredAndSortedStudents.length === 0 ? (
          <EmptyState
            icon={FaInfoCircle}
            title={`No ${categoryConfig.title} Found`}
            message={searchQuery 
              ? 'No students match your search criteria.' 
              : `There are no ${categoryConfig.title.toLowerCase()} in this category.`}
            showClearButton={!!searchQuery}
            onClearClick={() => setSearchQuery('')}
          />
        ) : (
          <StudentsGrid 
            students={filteredAndSortedStudents}
            onStudentClick={setSelectedStudentId}
          />
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

export default FilteredStudentsPage;
