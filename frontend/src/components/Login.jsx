import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { FaGoogle } from 'react-icons/fa';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, DEV_MODE } from '../config';
import { useDarkTheme } from './DarkThemeProvider';

// Dynamically import GoogleLogin to ensure client-side rendering only, preventing flicker
const GoogleLogin = lazy(() => import('@react-oauth/google').then(mod => ({ default: mod.GoogleLogin })));

// Mock backend status (unchanged)
const isBackendOnline = true;

// Updated GoogleLoginWrapper using Suspense for lazy loading
const GoogleLoginWrapper = ({ onSuccess, onError, isSignUp }) => {
  return (
    // Suspense handles the loading state while GoogleLogin loads
    <Suspense fallback={<div className="w-full h-[40px] bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm font-semibold">Loading...</div>}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap
        theme="outline"
        shape="rectangular"
        text={isSignUp ? "signup_with" : "signin_with"}
        width="100%"
      />
    </Suspense>
  );
};

const CustomGoogleButton = ({ onSuccess, onError, isSignUp }) => {
  const handleClick = () => {
    // @ts-ignore
    if (window.google && window.google.accounts) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: onSuccess,
      });
      // @ts-ignore
      window.google.accounts.id.prompt();
    } else {
      onError();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-semibold transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-gray-50"
    >
      <FaGoogle className="text-[#4285F4]" />
      {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
    </button>
  );
};

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' });
  const [userRole, setUserRole] = useState('student');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useDarkTheme();

  // Custom Google button (unchanged)
  const GoogleAuthButton = ({ isSignUp, userRole, onClick }) => {
    return (
      <button
        type="button"
        className={`group flex items-center justify-center gap-2 px-4 py-2 w-full border border-gray-300 rounded-lg bg-white text-sm font-semibold transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
          userRole === 'teacher' ? 'hover:bg-[#1E90FF]/10' : 'hover:bg-[#FF4B2B]/10'
        }`}
        onClick={onClick}
      >
        <FaGoogle className="text-gray-600 group-hover:text-[#4285F4]" />
        {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
      </button>
    );
  };

  const handleInputChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignUpInputChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // If DEV_MODE is enabled, use mock authentication
    if (DEV_MODE) {
      console.log('🔍 [LOGIN DEBUG] DEV_MODE enabled - using mock authentication');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login response
      const mockUserData = {
        id: loginData.username,
        username: loginData.username,
        jwt: 'mock-jwt-token-' + Date.now(),
        role: userRole
      };
      
      // Store user data in localStorage
      localStorage.setItem(STORAGE_KEYS.USER_ID, mockUserData.id);
      localStorage.setItem(STORAGE_KEYS.USERNAME, mockUserData.username);
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockUserData.jwt);
      localStorage.setItem(STORAGE_KEYS.ROLE, userRole);
      
      console.log('🔍 [LOGIN DEBUG] Mock login successful, navigating to:', userRole === 'student' ? '/main' : '/teacher');
      
      // Navigate based on user role
      navigate(userRole === 'student' ? '/main' : '/teacher');
      setIsLoading(false);
      return;
    }

    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;
    console.log('🔍 Current API_BASE_URL:', API_BASE_URL);
    console.log('🔍 Login endpoint:', API_ENDPOINTS.LOGIN);
    console.log('🔍 Full URL being called:', fullUrl);
    console.log('🔍 Frontend Origin:', window.location.origin);
    console.log('🔍 Request data:', { username: loginData.username, password: loginData.password });

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ username: loginData.username, password: loginData.password }),
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 403) {
          setError('CORS Error: Backend is blocking the request. Please check backend CORS configuration.');
          console.error('CORS Error - Status 403: Backend is rejecting the preflight request');
          return;
        }
        if (response.status === 0) {
          setError('Network Error: Cannot connect to backend. Please check if the server is running.');
          console.error('Network Error - Status 0: Cannot connect to backend');
          return;
        }
        if (response.status === 401) {
          setError('Invalid username or password. Please check your credentials and try again.');
          console.error('Authentication Error - Status 401: Invalid credentials');
          return;
        }
      }

      let data;
      try {
        data = await response.json();
        console.log('🔍 Response data:', data);
      } catch (jsonError) {
        console.error('🔍 JSON parse error:', jsonError);
        if (response.status === 401) {
          setError('Invalid username or password. Please check your credentials and try again.');
        } else {
          setError('Server returned an invalid response. Please try again.');
        }
        return;
      }

      if (response.ok) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, data.id || data.userId || data.username);
        localStorage.setItem(STORAGE_KEYS.USERNAME, data.username || loginData.username);
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.jwt || data.token);
        localStorage.setItem(STORAGE_KEYS.ROLE, userRole);
        navigate(userRole === 'student' ? '/main' : '/teacher');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('🔍 Fetch error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Network Error: Cannot connect to backend server. Please check if the server is running at ' + API_BASE_URL);
      } else {
        setError('Something went wrong: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // If DEV_MODE is enabled, use mock signup
    if (DEV_MODE) {
      console.log('🔍 [SIGNUP DEBUG] DEV_MODE enabled - using mock signup');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔍 [SIGNUP DEBUG] Mock signup successful');
      setError('Account created successfully! Please check your email and click the confirmation link to activate your account.');
      // Slide to sign-in panel instead of navigating
      setIsRightPanelActive(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ 
          username: signUpData.name, 
          email: signUpData.email, 
          password: signUpData.password, 
          ROLE: userRole 
        }),
      });

      console.log('🔍 Signup Response status:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          setError('CORS Error: Backend is blocking the request. Please check backend CORS configuration.');
          return;
        }
      }

      const data = await response.json();

      if (response.ok) {
        setError('Account created successfully! Please check your email and click the confirmation link to activate your account.');
        // Slide to sign-in panel instead of navigating
        setIsRightPanelActive(false);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('🔍 Signup error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Network Error: Cannot connect to backend server. Please check if the server is running at ' + API_BASE_URL);
      } else {
        setError('Something went wrong: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // If DEV_MODE is enabled, use mock forgot password
    if (DEV_MODE) {
      console.log('🔍 [FORGOT_PASSWORD DEBUG] DEV_MODE enabled - using mock forgot password');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔍 [FORGOT_PASSWORD DEBUG] Mock forgot password successful');
      setError('Password reset instructions sent to your email');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ email: forgotPasswordEmail, role: userRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setError('Password reset instructions sent to your email');
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        setError(data.message || 'Failed to process request');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    // If DEV_MODE is enabled, use mock Google auth
    if (DEV_MODE) {
      console.log('🔍 [GOOGLE_AUTH DEBUG] DEV_MODE enabled - using mock Google authentication');
      setError('Google authentication is not available in development mode. Please use regular login.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GOOGLE_AUTH}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = data.authUrl;
      } else {
        setError('Google authentication failed');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="flex justify-center items-center flex-col min-h-screen m-[-20px_0_50px] font-sans bg-gray-100 dark:bg-gray-900">
        {/* Role Toggle */}
        <div className="relative flex gap-4 mb-8 rounded-lg p-1 shadow-inner bg-gray-200 dark:bg-gray-700">
          <div
            className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-lg transition-all duration-300 ease-out ${
              userRole === 'student' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 transform translate-x-0' : 'bg-gradient-to-r from-indigo-500 to-indigo-600 transform translate-x-full'
            }`}
          ></div>
          <button
            className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              userRole === 'student' ? 'text-white' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setUserRole('student')}
          >
            Student
          </button>
          <button
            className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              userRole === 'teacher' ? 'text-white' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setUserRole('teacher')}
          >
            Teacher
          </button>
        </div>

        {/* Main Container */}
        <div
          className={`relative rounded-xl shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] w-full max-w-4xl min-h-[480px] overflow-hidden transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } ${
            userRole === 'teacher' ? 'shadow-[0_14px_28px_rgba(0,100,0,0.25),0_10px_10px_rgba(0,80,0,0.22)]' : ''
          } ${isRightPanelActive ? 'right-panel-active' : ''}`}
        >
          {/* Sign Up Form */}
          <div
            className={`absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] w-1/2 left-0 ${
              isRightPanelActive ? 'opacity-100 z-[5] translate-x-full' : 'opacity-0 z-[1]'
            }`}
          >
            <form onSubmit={handleSignUp} className={`flex flex-col items-center justify-center h-full px-12 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h1 className={`font-bold mb-4 text-3xl ${isDarkMode ? 'text-white' : 'text-black'}`}>Create Account</h1>
              <div className="my-5">
                <CustomGoogleButton
                  onSuccess={handleGoogleAuth}
                  onError={() => setError('Google authentication failed')}
                  isSignUp={true}
                />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className={`border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 focus:shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400 hover:bg-gray-600 focus:bg-gray-600' 
                    : 'bg-gray-100 text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white'
                } ${
                  userRole === 'teacher' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'
                }`}
                value={signUpData.name}
                onChange={handleSignUpInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={`border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 focus:shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400 hover:bg-gray-600 focus:bg-gray-600' 
                    : 'bg-gray-100 text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white'
                } ${
                  userRole === 'teacher' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'
                }`}
                value={signUpData.email}
                onChange={handleSignUpInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 focus:shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400 hover:bg-gray-600 focus:bg-gray-600' 
                    : 'bg-gray-100 text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white'
                } ${
                  userRole === 'teacher' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'
                }`}
                value={signUpData.password}
                onChange={handleSignUpInputChange}
                required
              />
              <button
                type="submit"
                className={`rounded-3xl border px-12 py-3 my-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  userRole === 'teacher' ? 'border-indigo-500 bg-indigo-500 focus:ring-indigo-500' : 'border-emerald-500 bg-emerald-500 focus:ring-emerald-500'
                }`}
              >
                Sign Up
              </button>
            </form>
          </div>

          {/* Sign In Form */}
          <div
            className={`absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] w-1/2 left-0 z-[2] ${isRightPanelActive ? 'translate-x-full' : ''}`}
          >
            <form onSubmit={handleLogin} className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
              <h1 className="font-bold mb-4 text-3xl">Sign in</h1>
              <div className="my-5">
                <CustomGoogleButton
                  onSuccess={handleGoogleAuth}
                  onError={() => setError('Google authentication failed')}
                  isSignUp={false}
                />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className={`bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm ${
                  userRole === 'teacher' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'
                }`}
                value={loginData.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm ${
                  userRole === 'teacher' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'
                }`}
                value={loginData.password}
                onChange={handleInputChange}
                required
              />
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
                className="text-gray-600 text-sm my-3 hover:text-gray-900 hover:underline hover:scale-105 transition-all duration-300 ease-out"
              >
                Forgot your password?
              </a>
              <button
                type="submit"
                className={`rounded-3xl border px-12 py-3 my-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  userRole === 'teacher' ? 'border-indigo-500 bg-indigo-500 focus:ring-indigo-500' : 'border-emerald-500 bg-emerald-500 focus:ring-emerald-500'
                }`}
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Overlay Container */}
          <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] z-[100] ${isRightPanelActive ? '-translate-x-full' : ''}`}>
            <div
              className={`relative -left-full h-full w-[200%] text-white transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                userRole === 'teacher' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              } ${isRightPanelActive ? 'translate-x-1/2' : ''}`}
            >
              <div
                className={`absolute flex flex-col items-center justify-center px-10 text-center h-full w-1/2 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                  isRightPanelActive ? 'translate-x-0' : '-translate-x-[15%]'
                }`}
              >
                <h1 className="font-bold mb-4 text-3xl">Welcome Back!</h1>
                <p className="text-sm font-normal leading-5 tracking-wider my-5">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="rounded-3xl border-2 border-white bg-transparent px-12 py-3 my-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  onClick={() => setIsRightPanelActive(false)}
                >
                  Sign In
                </button>
              </div>

              <div
                className={`absolute right-0 flex flex-col items-center justify-center px-10 text-center h-full w-1/2 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                  isRightPanelActive ? 'translate-x-[15%]' : 'translate-x-0'
                }`}
              >
                <h1 className="font-bold mb-4 text-3xl">
                  {userRole === 'teacher' ? 'Hello, Teacher!' : 'Hello, Friend!'}
                </h1>
                <p className="text-sm font-normal leading-5 tracking-wider my-5">
                  {userRole === 'teacher' 
                    ? 'Join our platform to transform your teaching experience with AI-powered tools'
                    : 'Enter your personal details and start journey with us'
                  }
                </p>
                <button
                  className="rounded-3xl border-2 border-white bg-transparent px-12 py-3 my-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  onClick={() => setIsRightPanelActive(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
                <p className="text-gray-600 mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <form onSubmit={handleForgotPassword}>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300"
                    required
                  />
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white rounded-lg ${
                        userRole === 'teacher' ? 'bg-indigo-500' : 'bg-emerald-500'
                      } hover:brightness-110 transition-all duration-300`}
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;