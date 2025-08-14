import React, { useState, useRef, useEffect } from 'react';
import '../css/StudentDetailsModalDesign.css';
import TextDisplay from './TextDisplay';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

const StudentDetailsModal = ({ studentId, onClose, onFetchStudentDetails }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const isFetching = useRef(false); // Prevent concurrent fetches

  // Fetch student details (single request)
  const fetchStudentDetails = async (id) => {
    if (isFetching.current) {
      console.log('Fetch already in progress for studentId:', id);
      return;
    }
    // Convert id to string and validate
    const studentIdStr = id != null ? String(id).trim() : '';
    if (!studentIdStr) {
      console.log('Invalid studentId provided, skipping fetch:', id);
      setError('Please provide a valid student ID');
      setIsLoading(false);
      return;
    }
    isFetching.current = true;

    console.log('Fetching student details for studentId:', studentIdStr, 'Type:', typeof id);
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        studentId: studentIdStr
      });
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_PROFILE}?${params.toString()}`, {
        method: 'GET'
      });

      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const rawText = await response.text();
        console.log('Raw response (not JSON):', rawText);
        throw new Error(`Server response is not JSON. Content-Type: ${contentType || 'none'}, Response: ${rawText}`);
      }

      const data = await response.json();
      console.log('Fetched student details:', data);

      if (response.ok) {
        // Backend returns student data: { id, attemptCount, correctCount, last10Performance }
        if (data && data.id) {
          console.log('Setting details:', { ...data, studentId: studentIdStr });
          setDetails({ ...data, studentId: studentIdStr }); // Store studentId for retry
        } else {
          throw new Error('Invalid student data structure');
        }
      } else {
        throw new Error(data.message || `Server responded with status ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      let errorMessage = err.message || 'Something went wrong';
      if (err.message.includes('Load failed')) {
        errorMessage = 'Unable to connect to the server. Please check your network or try again later.';
      }
      console.log('Setting error:', errorMessage);
      setError(errorMessage);
    } finally {
      console.log('Fetch complete, setting isLoading to false');
      setIsLoading(false);
      isFetching.current = false; // Allow future fetches
    }
  };

  // Pass fetch function to parent (optional)
  if (onFetchStudentDetails) {
    console.log('Passing fetchStudentDetails to parent');
    onFetchStudentDetails(fetchStudentDetails);
  }

  // Fetch details when studentId prop changes
  useEffect(() => {
    if (studentId != null) {
      console.log('studentId prop received:', studentId, 'Type:', typeof studentId);
      fetchStudentDetails(studentId);
    } else {
      console.log('No studentId prop, resetting details');
      setDetails(null);
      setError('');
      setIsLoading(false);
    }
  }, [studentId]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      console.log('Backdrop clicked, closing modal');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" ref={modalRef}>
        {isLoading && (
          <div className="modal-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading Student Details...</p>
          </div>
        )}
        {error ? (
          <div className="modal-error">
            <p>{error}</p>
            <button
              onClick={() => {
                console.log('Retry clicked, fetching with studentId:', details?.studentId || studentId);
                isFetching.current = false; // Allow retry
                fetchStudentDetails(details?.studentId || studentId || '');
              }}
            >
              Retry
            </button>
          </div>
        ) : details ? (
          <div className="modal-details">
            <h2 className="modal-title">Student Profile</h2>
            <div className="student-profile-data">
              <div className="profile-item">
                <strong>Student ID:</strong> {details.id}
              </div>
              <div className="profile-item">
                <strong>Total Attempts:</strong> {details.attemptCount}
              </div>
              <div className="profile-item">
                <strong>Correct Answers:</strong> {details.correctCount}
              </div>
              <div className="profile-item">
                <strong>Accuracy:</strong> {details.attemptCount > 0 ? Math.round((details.correctCount / details.attemptCount) * 100) : 0}%
              </div>
              <div className="profile-item">
                <strong>Last 10 Performance:</strong>
                <div className="performance-list">
                  {details.last10Performance && details.last10Performance.map((result, index) => (
                    <span key={index} className={`performance-item ${result ? 'correct' : 'incorrect'}`}>
                      {result ? '✓' : '✗'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button className="modal-close-button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (<></>)
        }
      </div>
    </div>
  );
};

export default StudentDetailsModal;