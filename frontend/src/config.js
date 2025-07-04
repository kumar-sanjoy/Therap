// API Configuration
export const API_BASE_URL = 'http://localhost:8091';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/api/login',
    SIGNUP: '/api/signup',
    FORGOT_PASSWORD: '/api/forgot-password',
    GOOGLE_AUTH: '/api/google-auth',
    
    // Learning endpoints
    LEARN: '/api/learn',
    QUIZ: '/exam/mcq',
    WRITTEN: '/api/written',
    SUBMIT_WRITTEN: '/api/submit-written',
    
    // Notes and Doubts
    GENERATE_NOTE: '/api/notes',
    CLEAR_DOUBT: '/api/doubts',
    
    // Progress and Stats
    STATS: '/api/stats',
    NEW_MISTAKES: '/api/newMistakes',
    PREV_MISTAKES: '/api/prevMistakes',
    
    // Teacher endpoints
    TEACHER_DASHBOARD: '/api/teacher/dashboard',
    TEACHER_API: '/api/teacher'
};

// Development Mode
export const DEV_MODE = true;

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