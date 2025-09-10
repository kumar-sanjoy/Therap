import { STORAGE_KEYS } from '../../config';

// Helper function to format time in MM:SS format
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to calculate progress percentage
export const calculateProgressPercentage = (currentIndex, totalContent) => {
  return totalContent.length > 0 ? ((currentIndex + 1) / totalContent.length) * 100 : 0;
};

// Helper function to check if user is authenticated and has correct role
export const checkAuthAndRole = (navigate) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  
  if (!token || !username) {
    navigate('/login');
    return false;
  }
  
  // Check if user has the correct role for this page (Learn is student-only)
  if (role !== 'STUDENT') {
    if (role === 'TEACHER') {
      navigate('/teacher');
    } else {
      navigate('/login');
    }
    return false;
  }
  
  return true;
};

// Helper function to parse AI response from different API formats
export const parseAIResponse = (data) => {
  // Handle different response formats
  if (data.answer) {
    return data.answer;
  } else if (data.response) {
    return data.response;
  } else if (data.message) {
    return data.message;
  } else if (typeof data === 'string') {
    return data;
  } else {
    console.warn('🔍 [LEARN DEBUG] Unknown response format:', data);
    return 'No response received';
  }
};
