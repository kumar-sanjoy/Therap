import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';
import StudentDetailsModal from './StudentDetailsModal';
import '../css/TeacherMainDesign.css';
import flowLogo from '../assets/flow-white.jpg';

const TeacherMain = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]); // Ensure students is always an array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [sortBy, setSortBy] = useState('studentId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEACHER_DASHBOARD}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const fetchStudents = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEACHER_DASHBOARD}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check Content-Type header
        // const contentType = response.headers.get('content-type');
        // if (!contentType || !contentType.includes('application/json')) {
        //   const rawText = await response.text();
        //   console.log('Raw response (not JSON):', rawText);
        //   throw new Error(`Server response is not JSON. Content-Type: ${contentType || 'none'}, Response: ${rawText}`);
        // }

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Server responded with status ${response.status}`);
        }

        let data;
        try {
          data = await response.json();
          console.log('Fetched student data:', data);
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          const rawText = await response.text();
          console.log('Raw response (failed to parse as JSON):', rawText);
          throw new Error(`Failed to parse server response as JSON. Response: ${rawText}`);
        }

        // Validate data structure and ensure it's an array
        if (isMounted) {
          if (Array.isArray(data)) {
            setStudents(data);
          } else if (data === null) {
            setStudents([]); // Treat null as an empty array
          } else {
            throw new Error('Expected an array of student data');
          }
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        if (isMounted) {
          setError(err.message || 'Something went wrong');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Sort students based on sortBy and sortOrder
  const sortedStudents = [...students].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'studentId') {
      comparison = a.studentId.toString().localeCompare(b.studentId.toString()); // Ensure string comparison
    } else if (sortBy === 'totalQuestions') {
      comparison = a.totalQuestions - b.totalQuestions;
    } else if (sortBy === 'performance') {
      const perfA = a.totalQuestions > 0 ? a.correctAnswers / a.totalQuestions : 0;
      const perfB = b.totalQuestions > 0 ? b.correctAnswers / b.totalQuestions : 0;
      comparison = perfA - perfB;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (key) => {
    if (sortBy === key) {
      // Toggle sort order if same key
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort key and default to ascending
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const drawProgressRing = (canvas, correct, total) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    const radius = 50;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#6EC1E4';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Progress ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (percentage / 100) * 2 * Math.PI);
    ctx.strokeStyle = '#F06292';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Percentage text
    ctx.font = '16px Orbitron';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(percentage)}%`, centerX, centerY);
  };

  // Redraw progress rings whenever sortedStudents changes
  useEffect(() => {
    sortedStudents.forEach((student) => {
      const canvas = document.querySelector(`#progress-ring-${student.studentId}`);
      if (canvas) {
        drawProgressRing(canvas, student.correctAnswers, student.totalQuestions);
      }
    });
  }, [sortedStudents]);

  return (
    <div className="tm-select-page">
      {isLoading && (
        <div className="tm-loading-overlay">
          <div className="tm-rolling-spinner"></div>
          <p className="tm-loading-text">Loading Student Data...</p>
        </div>
      )}
      <header className="tm-select-header">
        <img src={flowLogo} alt="FLOW Logo" className="tm-company-logo" />
        <button className="tm-back-button" onClick={() => navigate('/')}>
          Logout
        </button>
      </header>
      <div className="tm-teacher-container">
        <h2 className="tm-teacher-title">Teacher Dashboard</h2>
        {error ? (
          <p className="tm-no-students">{error}</p>
        ) : students.length === 0 ? (
          <p className="tm-no-students">No student data available.</p>
        ) : (
          <>
            {/* Sorting Controls */}
            <div className="tm-sort-controls">
              <button
                className={`tm-sort-btn ${sortBy === 'studentId' ? 'active' : ''}`}
                onClick={() => handleSort('studentId')}
              >
                Sort by ID {sortBy === 'studentId' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                className={`tm-sort-btn ${sortBy === 'totalQuestions' ? 'active' : ''}`}
                onClick={() => handleSort('totalQuestions')}
              >
                Sort by Total Questions {sortBy === 'totalQuestions' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                className={`tm-sort-btn ${sortBy === 'performance' ? 'active' : ''}`}
                onClick={() => handleSort('performance')}
              >
                Sort by Performance {sortBy === 'performance' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
            <ul className="tm-student-list">
              {sortedStudents.map((student) => {
                const percentage = student.totalQuestions > 0 ? (student.correctAnswers / student.totalQuestions) * 100 : 0;
                const performanceClass = percentage >= 80 ? 'tm-high-performer' : percentage < 50 ? 'tm-low-performer' : 'tm-average-performer';
                return (
                  <li
                    key={student.studentId}
                    className={`tm-student-item ${performanceClass}`}
                    onClick={() => setSelectedStudentId(student.studentId)}
                  >
                    <div className="tm-student-id">
                      Student ID: {student.studentId}
                    
                    </div>
                    
                    <div className="tm-student-stats">
                      <p>Total Questions: {student.totalQuestions}</p>
                      <p>Correct Answers: {student.correctAnswers}</p>
                      <canvas
                        id={`progress-ring-${student.studentId}`}
                        className="tm-progress-ring"
                        width="120"
                        height="120"
                      ></canvas>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
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