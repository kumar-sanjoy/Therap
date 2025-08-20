import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaUserGraduate, FaChartLine, FaLightbulb, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';

const StudentDetailsModal = ({ studentId, onClose, onFetchStudentDetails }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const isFetching = useRef(false); // Prevent concurrent fetches

  // Fetch student analysis report
  const fetchStudentAnalysis = async (id) => {
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
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" ref={modalRef}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FaUserGraduate className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Student Analysis Report</h2>
              <p className="text-sm text-gray-500">Detailed performance analysis and recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <FaTimes className="text-gray-500 text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-xl animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Generating Analysis</h3>
              <p className="text-gray-500">Analyzing student performance and generating recommendations...</p>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl">
                  <FaExclamationTriangle className="text-red-500 text-lg" />
                </div>
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold mb-2">Error Loading Analysis</h4>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={() => {
                      isFetching.current = false;
                      fetchStudentAnalysis(details?.studentId || studentId || '');
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {details && details.report && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <FaUserGraduate className="text-indigo-600 text-xl" />
                  <h3 className="text-xl font-bold text-gray-800">Student Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Student Name</p>
                    <p className="text-lg font-semibold text-gray-800">{details.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Student ID</p>
                    <p className="text-lg font-semibold text-gray-800">{details.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Analysis Report */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <FaChartLine className="text-green-600 text-xl" />
                    <h3 className="text-xl font-bold text-gray-800">Performance Analysis</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
                      {details.report}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Close Report
                </button>
                <button
                  onClick={() => {
                    // Generate a new report
                    fetchStudentAnalysis(details.studentId);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-300 font-medium"
                >
                  Refresh Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;