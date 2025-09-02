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
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  
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
