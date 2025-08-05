// API Configuration
export const API_BASE_URL = 'http://localhost:8080';

// API Endpoints - Updated to match Spring Boot backend
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    SIGNUP: '/auth/register',
    FORGOT_PASSWORD: '/api/forgot-password',
    GOOGLE_AUTH: '/api/google-auth',
    
    // Exam endpoints
    MCQ: '/exam/mcq',
    SUBMIT_MCQ: '/exam/submit-mcq',
    PREVIOUS_MCQ: '/exam/previous-mcq',
    WRITTEN_QUESTION: '/exam/written',
    SUBMIT_WRITTEN: '/exam/submit-written',
    
    // Learning endpoints
    LEARN: '/learn/learn',
    CLEAR_DOUBT: '/learn/doubts',
    GENERATE_NOTE: '/learn/notes',
    
    // Profile endpoints
    TEACHER_PROFILE: '/profile/teacher',
    STUDENT_PROFILE: '/profile/student',
    
    // Legacy endpoints (keeping for backward compatibility)
    QUIZ: '/api/quiz',
    STATS: '/api/stats',
    NEW_MISTAKES: '/api/newMistakes',
    PREV_MISTAKES: '/api/prevMistakes',
    TEACHER_DASHBOARD: '/api/teacher/dashboard',
    TEACHER_API: '/api/teacher'
};

// Development Mode
export const DEV_MODE = false;

// App Constants
export const APP_NAME = 'FLOW';
export const APP_VERSION = '1.0.0';

// Local Storage Keys
export const STORAGE_KEYS = {
    USER_ID: 'userId',
    TOKEN: 'token',
    USER_DATA: 'userData'
};

// Navigation Routes
export const ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
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