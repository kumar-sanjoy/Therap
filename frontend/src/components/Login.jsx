import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { FaGoogle } from 'react-icons/fa';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';

// Dynamically import GoogleLogin to ensure client-side rendering only, preventing flicker
const GoogleLogin = lazy(() => import('@react-oauth/google').then(mod => ({ default: mod.GoogleLogin })));

// Mock backend status (unchanged)
const isBackendOnline = false;

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
  const [loginData, setLoginData] = useState({ USER: '', USER_PASS: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' });
  const [userRole, setUserRole] = useState('student');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...loginData, ROLE: userRole }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, loginData.USER);
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.ROLE, userRole);
        navigate(userRole === 'student' ? '/main' : '/teacher');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...signUpData, ROLE: userRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setError('Account created successfully! Now you can sign in.');
        setIsRightPanelActive(false);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GOOGLE_AUTH}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      <div className="flex justify-center items-center flex-col bg-gray-100 min-h-screen m-[-20px_0_50px] font-sans">
        {/* Role Toggle */}
        <div className="relative flex gap-4 mb-8 bg-gray-200 rounded-lg p-1 shadow-inner">
          <div
            className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-lg transition-all duration-300 ease-out ${
              userRole === 'student' ? 'bg-[#FF4B2B] transform translate-x-0' : 'bg-[#1E90FF] transform translate-x-full'
            }`}
          ></div>
          <button
            className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              userRole === 'student' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setUserRole('student')}
          >
            Student
          </button>
          <button
            className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              userRole === 'teacher' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setUserRole('teacher')}
          >
            Teacher
          </button>
        </div>

        {/* Main Container */}
        <div
          className={`relative bg-white rounded-xl shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] w-full max-w-4xl min-h-[480px] overflow-hidden transition-all duration-300 ${
            userRole === 'teacher' ? 'shadow-[0_14px_28px_rgba(0,100,0,0.25),0_10px_10px_rgba(0,80,0,0.22)]' : ''
          } ${isRightPanelActive ? 'right-panel-active' : ''}`}
        >
          {/* Sign Up Form */}
          <div
            className={`absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] w-1/2 left-0 ${
              isRightPanelActive ? 'opacity-100 z-[5] translate-x-full' : 'opacity-0 z-[1]'
            }`}
          >
            <form onSubmit={handleSignUp} className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
              <h1 className="font-bold mb-4 text-3xl">Create Account</h1>
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
                className={`bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm ${
                  userRole === 'teacher' ? 'focus:ring-[#1E90FF]' : 'focus:ring-[#FF4B2B]'
                }`}
                value={signUpData.name}
                onChange={handleSignUpInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={`bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm ${
                  userRole === 'teacher' ? 'focus:ring-[#1E90FF]' : 'focus:ring-[#FF4B2B]'
                }`}
                value={signUpData.email}
                onChange={handleSignUpInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm ${
                  userRole === 'teacher' ? 'focus:ring-[#1E90FF]' : 'focus:ring-[#FF4B2B]'
                }`}
                value={signUpData.password}
                onChange={handleSignUpInputChange}
                required
              />
              <button
                type="submit"
                className={`rounded-3xl border px-12 py-3 my-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  userRole === 'teacher' ? 'border-[#1E90FF] bg-[#1E90FF] focus:ring-[#1E90FF]' : 'border-[#FF4B2B] bg-[#FF4B2B] focus:ring-[#FF4B2B]'
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
                name="USER"
                placeholder="User ID"
                className={`bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm ${
                  userRole === 'teacher' ? 'focus:ring-[#1E90FF]' : 'focus:ring-[#FF4B2B]'
                }`}
                value={loginData.USER}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="USER_PASS"
                placeholder="Password"
                className={`bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm ${
                  userRole === 'teacher' ? 'focus:ring-[#1E90FF]' : 'focus:ring-[#FF4B2B]'
                }`}
                value={loginData.USER_PASS}
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
                  userRole === 'teacher' ? 'border-[#1E90FF] bg-[#1E90FF] focus:ring-[#1E90FF]' : 'border-[#FF4B2B] bg-[#FF4B2B] focus:ring-[#FF4B2B]'
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
                userRole === 'teacher' ? 'bg-gradient-to-r from-[#1E90FF] to-[#4169E1]' : 'bg-gradient-to-r from-[#FF4B2B] to-[#FF416C]'
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
                <h1 className="font-bold mb-4 text-3xl">Hello, Friend!</h1>
                <p className="text-sm font-normal leading-5 tracking-wider my-5">
                  Enter your personal details and start journey with us
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
                        userRole === 'teacher' ? 'bg-[#1E90FF]' : 'bg-[#FF4B2B]'
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