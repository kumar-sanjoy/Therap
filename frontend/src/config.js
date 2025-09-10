export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const EXAM_API_BASE_URL = import.meta.env.VITE_EXAM_API_BASE_URL;
export const LEARNING_API_BASE_URL = import.meta.env.VITE_LEARNING_API_BASE_URL;



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
    CONFIRM_EMAIL: '/auth/register/confirmToken', // GET method - expects token as query parameter
    FORGOT_PASSWORD: '/api/forgot-password',
    GOOGLE_AUTH: '/api/google-auth',
    
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
    ASK_QUESTION: '/learn/doubts',
    
    // Profile endpoints
    TEACHER_PROFILE: '/profile/teacher',
    STUDENT_PROFILE: '/profile/student',
    TEACHER_REPORT: '/profile/teacher/generate-report',
    STUDENT_DETAILS: '/profile/student/details',
    GET_TEACHERS: '/profile/student/get-teachers',
    UPSERT_TEACHER: '/profile/student/upsert-teacher',
    
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

// Utility function to safely construct API URLs
export const buildApiUrl = (baseUrl, endpoint, params = {}) => {
  // Validate inputs
  if (!baseUrl || baseUrl === 'undefined') {
    throw new Error(`Invalid base URL provided: ${baseUrl}`);
  }
  
  if (!endpoint || endpoint === 'undefined') {
    throw new Error(`Invalid endpoint provided: ${endpoint}. Available endpoints: ${Object.keys(API_ENDPOINTS).join(', ')}`);
  }
  
  // Clean and validate baseUrl
  const cleanBaseUrl = baseUrl.trim().replace(/\s+/g, '');
  if (!cleanBaseUrl.startsWith('http://') && !cleanBaseUrl.startsWith('https://')) {
    throw new Error(`Invalid base URL format: ${cleanBaseUrl}. URL must start with http:// or https://`);
  }
  
  // Ensure baseUrl doesn't end with slash and endpoint starts with slash
  const normalizedBaseUrl = cleanBaseUrl.endsWith('/') ? cleanBaseUrl.slice(0, -1) : cleanBaseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construct the base URL
  const url = `${normalizedBaseUrl}${cleanEndpoint}`;
  
  // Add query parameters if provided
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'undefined') {
        // Ensure proper encoding of parameter values
        const cleanValue = value.toString().trim();
        if (cleanValue) {
          searchParams.append(key, cleanValue);
        }
      }
    });
    return `${url}?${searchParams.toString()}`;
  }
  
  return url;
};

// Utility function to safely construct API URLs with template literals
export const safeApiUrl = (baseUrl, endpoint, params = {}) => {
  // Validate inputs
  if (!baseUrl || baseUrl === 'undefined') {
    throw new Error(`Invalid base URL provided: ${baseUrl}`);
  }
  
  if (!endpoint || endpoint === 'undefined') {
    throw new Error(`Invalid endpoint provided: ${endpoint}. Available endpoints: ${Object.keys(API_ENDPOINTS).join(', ')}`);
  }
  
  // Construct the base URL
  const url = `${baseUrl}${endpoint}`;
  
  // Add query parameters if provided
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'undefined') {
        searchParams.append(key, value.toString());
      }
    });
    return `${url}?${searchParams.toString()}`;
  }
  
  return url;
};

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



 