// API Configuration
export const API_BASE_URL = 'https://8bbf7583f46d.ngrok-free.app';
export const EXAM_API_BASE_URL = 'https://8bbf7583f46d.ngrok-free.app';
export const LEARNING_API_BASE_URL = 'https://8bbf7583f46d.ngrok-free.app';

// Class and Subject Mapping for Exam API
export const class_map = { 
  '9': 'a', 
  '10': 'a', 
  '8': 'b', 
  '7': 'c', 
  '6': 'd' 
};

export const subject_map = { 
  'Physics': 'a', 
  'Chemistry': 'b', 
  'Biology': 'c',
  'Science': 'S',
  'Economics': 'd',
  'Geography': 'g',
  'Business Entrepre.': 'f'
};

// Mapping functions
export const mapClassForExamAPI = (className) => {
  // Extract the number from className (e.g., "Class 9" -> "9")
  const classNumber = className?.split(' ')[1];
  return class_map[classNumber] || 'a'; // Default to 'a' if not found
};

export const mapSubjectForExamAPI = (subjectName) => {
  return subject_map[subjectName] || 'a'; // Default to 'a' if not found
};

// API Endpoints - Updated to match Spring Boot backend
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    SIGNUP: '/auth/register',
    CONFIRM_EMAIL: '/auth/confirm-email', // GET method - expects token as query parameter
    FORGOT_PASSWORD: '/auth/forgot-password',
    GOOGLE_AUTH: '/auth/google-login',
    
    // Exam endpoints (using port 8091)
    MCQ: '/exam/mcq',
    MCQ_QUESTIONS: '/exam/mcq',
    SUBMIT_MCQ: '/exam/submit-mcq',
    PREVIOUS_MCQ: '/exam/previous-mcq',
    WRITTEN_QUESTION: '/exam/written',
    SUBMIT_WRITTEN: '/exam/submit-written',
    
    // Learning endpoints (using port 8092)
    LEARN: '/learn/learn',
    LEARN_CONTENT: '/learn/content',
    CLEAR_DOUBT: '/learn/doubts',
    GENERATE_NOTE: '/learn/notes',
    
    // Profile endpoints
    TEACHER_PROFILE: '/profile/teacher',
    STUDENT_PROFILE: '/profile/student',
    TEACHER_REPORT: '/profile/teacher/generate-report',
    STUDENT_DETAILS: '/profile/student/details',
    
    // Legacy endpoints (keeping for backward compatibility)
    QUIZ: '/api/quiz',
    STATS: '/api/stats',
    NEW_MISTAKES: '/api/newMistakes',
    PREV_MISTAKES: '/api/prevMistakes',
    TEACHER_DASHBOARD: '/api/teacher/dashboard',
    TEACHER_API: '/api/teacher'
};

// App Constants
export const APP_NAME = 'FLOW';
export const APP_VERSION = '1.0.0';

// Local Storage Keys
export const STORAGE_KEYS = {
    USER_ID: 'userId',
    USERNAME: 'username',
    TOKEN: 'token',
    ROLE: 'role',
    USER_DATA: 'userData'
};

// Navigation Routes
export const ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
    EMAIL_CONFIRMATION: '/register/confirmToken',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    MAIN: '/main',
    SELECT: '/select',
    LEARN: '/learn',
    QUIZ: '/quiz',
    WRITTEN: '/written-question',
    NOTES: '/note',
    SHOW_NOTES: '/shownotes',
    DOUBT: '/ask',
    PREV_MISTAKES: '/prev',
    TEACHER: '/teacher',
    INTRO: '/'
}; 