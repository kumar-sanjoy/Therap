import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaUserGraduate, FaSpinner, FaCheck, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import { API_BASE_URL, STORAGE_KEYS, API_ENDPOINTS } from '../../config';

const MentorModal = ({ isOpen, onClose, currentMentor, onMentorChange }) => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Fetch all teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      setError('');
      setSuccess('');
      setSearchTerm('');
      setSelectedTeacher(null);
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      console.log('🔍 [MENTOR_MODAL DEBUG] Fetching teachers:', {
        token: token ? 'Present' : 'Missing',
        url: `${API_BASE_URL}${API_ENDPOINTS.GET_TEACHERS}`
      });
      
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_TEACHERS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 [MENTOR_MODAL DEBUG] Get teachers response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [MENTOR_MODAL DEBUG] Teachers data:', data);
        setTeachers(data.teachers || []);
      } else {
        const errorData = await response.text();
        console.error('🔍 [MENTOR_MODAL DEBUG] Get teachers error response:', errorData);
        setError(`Failed to fetch teachers: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to fetch teachers: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const assignMentor = async (teacherUsername) => {
    setIsAssigning(true);
    setError('');
    setSelectedTeacher(teacherUsername);
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const studentUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
      
      console.log('🔍 [MENTOR_MODAL DEBUG] Assigning mentor:', {
        token: token ? 'Present' : 'Missing',
        studentUsername,
        teacherUsername,
        url: `${API_BASE_URL}${API_ENDPOINTS.UPSERT_TEACHER}?username=${studentUsername}&teacher=${teacherUsername}`
      });
      
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        return;
      }
      
      // Use GET method since both endpoints are GET methods
      console.log('🔍 [MENTOR_MODAL DEBUG] Using GET method for mentor assignment');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPSERT_TEACHER}?username=${studentUsername}&teacher=${teacherUsername}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 [MENTOR_MODAL DEBUG] Final response status:', response.status);
      
      if (response.ok) {
        setSuccess('Mentor assigned successfully!');
        setTimeout(() => {
          onMentorChange(teacherUsername);
          onClose();
        }, 1500);
      } else {
        const errorData = await response.text();
        console.error('🔍 [MENTOR_MODAL DEBUG] Error response:', errorData);
        
        // Try to parse JSON error response
        let errorMessage = `Failed to assign mentor: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error) {
            errorMessage += ` - ${errorJson.error}`;
          }
          if (errorJson.message) {
            errorMessage += ` - ${errorJson.message}`;
          }
        } catch (e) {
          // If not JSON, use the raw text
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      setError('Failed to assign mentor: ' + error.message);
    } finally {
      setIsAssigning(false);
      setSelectedTeacher(null);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    if (!isAssigning) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700 animate-slideUp">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaUserGraduate className="text-xl sm:text-2xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Mentor Management</h2>
                <p className="text-indigo-100 text-xs sm:text-sm">Connect with your learning guide</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isAssigning}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <FaTimes className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>

        {/* Current Mentor Status */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 animate-pulse"></div>
            Current Status
          </h3>
          
          {currentMentor ? (
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 p-3 sm:p-4 rounded-xl border border-indigo-200 dark:border-indigo-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <FaUserGraduate className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">Your Mentor</p>
                    <p className="font-bold text-indigo-800 dark:text-indigo-300 text-base sm:text-lg">{currentMentor}</p>
                  </div>
                </div>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <FaCheck className="mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-400 dark:bg-gray-600 rounded-lg">
                    <FaUserGraduate className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Mentor Status</p>
                    <p className="font-bold text-gray-700 dark:text-gray-300 text-base sm:text-lg">Not Assigned</p>
                  </div>
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm flex items-center">
                  <FaInfoCircle className="mr-1" />
                  Select below
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Selection - Scrollable Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center flex-shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            {currentMentor ? 'Change Mentor' : 'Select Mentor'}
          </h3>
          
          {/* Search Input */}
          <div className="relative mb-4 sm:mb-6 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 dark:text-gray-500 text-sm sm:text-base" />
            </div>
            <input
              type="text"
              placeholder="Search for teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white dark:placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
              disabled={isAssigning}
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-700/50 rounded-xl animate-fadeIn flex-shrink-0">
              <div className="flex items-center">
                <FaCheck className="text-green-600 dark:text-green-400 mr-3 animate-bounce" />
                <p className="text-green-700 dark:text-green-300 font-medium text-sm sm:text-base">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 border border-red-200 dark:border-red-700/50 rounded-xl animate-fadeIn flex-shrink-0">
              <p className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* Teachers List - Scrollable Area */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0" style={{ scrollbarWidth: 'thin' }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="p-3 sm:p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                  <FaSpinner className="animate-spin text-2xl sm:text-3xl text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">Loading teachers...</p>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <FaUserGraduate className="text-2xl sm:text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-center text-sm sm:text-base">
                  {searchTerm ? 'No teachers found matching your search' : 'No teachers available at the moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredTeachers.map((teacher, index) => (
                  <div
                    key={index}
                    onClick={() => !isAssigning && assignMentor(teacher)}
                    className={`group p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                      isAssigning || teacher === currentMentor
                        ? 'cursor-not-allowed opacity-60' 
                        : 'cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-900/20 dark:hover:to-indigo-800/10 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    } border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 ${
                      selectedTeacher === teacher ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                          teacher === currentMentor
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40'
                        }`}>
                          <FaUserGraduate className={`text-base sm:text-lg ${
                            teacher === currentMentor
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{teacher}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {teacher === currentMentor ? 'Currently your mentor' : 'Available mentor'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {teacher === currentMentor && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <FaCheck className="text-xs sm:text-sm" />
                          </div>
                        )}
                        {isAssigning && selectedTeacher === teacher ? (
                          <FaSpinner className="animate-spin text-indigo-500" />
                        ) : teacher !== currentMentor && (
                          <FaChevronRight className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-200 group-hover:translate-x-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={isAssigning}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
          >
            {isAssigning ? 'Assigning...' : 'Close'}
          </button>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default MentorModal;
