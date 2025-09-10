import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../../../config';

// Import modular components
import ModalHeader from './ModalHeader';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import StudentInfo from './StudentInfo';
import AnalysisReport from './AnalysisReport';
import ActionButtons from './ActionButtons';

const StudentDetailsModal = ({ studentId, onClose, onFetchStudentDetails }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const modalRef = useRef(null);
  const isFetching = useRef(false); // Prevent concurrent fetches

  // Fetch student analysis report
  const fetchStudentAnalysis = async (id, isRefresh = false) => {
    if (isFetching.current) {
      return;
    }
    
    const studentIdStr = id != null ? String(id).trim() : '';
    if (!studentIdStr) {
      setError('Please provide a valid student ID');
      setIsLoading(false);
      return;
    }
    isFetching.current = true;

    setIsLoading(true);
    setIsRefreshing(isRefresh);
    setError('');
    
    try {
      // Get teacher username from localStorage
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        if (!username) {
          throw new Error('Teacher not logged in');
        }

        const params = new URLSearchParams({
          username: username,
          studentId: studentIdStr
        });
        
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEACHER_REPORT}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          if (data && data.report) {
            setDetails({ 
              studentId: studentIdStr,
              report: data.report,
              studentName: studentIdStr // Using studentId as name for now
            });
          } else {
            throw new Error('No analysis report available for this student');
          }
        } else {
          throw new Error(data.message || `Server responded with status ${response.status}`);
        }
    } catch (err) {
      let errorMessage = err.message || 'Something went wrong';
      if (err.message.includes('Load failed')) {
        errorMessage = 'Unable to connect to the server. Please check your network or try again later.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  // Pass fetch function to parent (optional)
  if (onFetchStudentDetails) {
    onFetchStudentDetails(fetchStudentAnalysis);
  }

  // Fetch details when studentId prop changes
  useEffect(() => {
    if (studentId != null) {
      fetchStudentAnalysis(studentId);
    } else {
      setDetails(null);
      setError('');
      setIsLoading(false);
    }
  }, [studentId]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300" ref={modalRef}>
        {/* Header */}
        <ModalHeader onClose={onClose} />

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && (
            <LoadingState isRefreshing={isRefreshing} />
          )}

          {error && (
            <ErrorState 
              error={error} 
              onRetry={fetchStudentAnalysis} 
              studentId={details?.studentId || studentId || ''} 
            />
          )}

          {details && details.report && (
            <div className="space-y-6">
              {/* Student Info */}
              <StudentInfo studentName={details.studentName} />

              {/* Analysis Report */}
              <AnalysisReport report={details.report} />

              {/* Action Buttons */}
              <ActionButtons 
                onClose={onClose}
                onRefresh={fetchStudentAnalysis}
                studentId={details.studentId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;