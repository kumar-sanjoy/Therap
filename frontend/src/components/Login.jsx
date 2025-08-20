import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' });
  const [userRole, setUserRole] = useState('STUDENT');
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
        className={`group flex items-center justify-center gap-3 px-4 py-3 w-full border border-gray-300 rounded-lg bg-white text-sm font-semibold transition-all duration-300 hover:shadow-md hover:scale-[1.02] text-gray-700 hover:bg-gray-50 ${
          userRole === 'TEACHER' ? 'hover:border-indigo-300' : 'hover:border-emerald-300'
        }`}
        onClick={onClick}
      >
        <FaGoogle className="text-gray-600 group-hover:text-[#4285F4] text-lg" />
        <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
      </button>
    );
  };

  // Helper function to check if form is valid
  const isSignUpFormValid = () => {
    return signUpData.name.trim() && signUpData.email.trim() && signUpData.password.trim();
  };

  const isLoginFormValid = () => {
    return loginData.username.trim() && loginData.password.trim();
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

    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;

    // Debug: Log the login request data
    console.log('🔍 [LOGIN DEBUG] Login request:', {
      username: loginData.username,
      role: userRole,
      endpoint: fullUrl
    });

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
        body: JSON.stringify({ 
          username: loginData.username, 
          password: loginData.password,
          role: userRole 
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('CORS Error: Backend is blocking the request. Please check backend CORS configuration.');
          return;
        }
        
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return;
      }

      const data = await response.json();

      // Debug: Log the login response data
      console.log('🔍 [LOGIN DEBUG] Login response:', {
        id: data.id,
        username: data.username,
        role: data.role,
        normalizedRole: data.role ? data.role.toUpperCase() : 'STUDENT'
      });

      // Store user data in localStorage
      localStorage.setItem(STORAGE_KEYS.USER_ID, data.id);
      localStorage.setItem(STORAGE_KEYS.USERNAME, data.username);
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.jwt);
      // Normalize role to uppercase for consistency
      const normalizedRole = data.role ? data.role.toUpperCase() : 'STUDENT';
      localStorage.setItem(STORAGE_KEYS.ROLE, normalizedRole);

      // Navigate based on user role
      navigate(normalizedRole === 'STUDENT' ? '/main' : '/teacher');
    } catch (err) {
      console.error('Login error:', err);
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
      console.error('Signup error:', err);
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
      <div className="flex justify-center items-center flex-col min-h-screen m-[-20px_0_50px] font-sans bg-gray-100 login-container">
        {/* Force light theme styles for Login component */}
        <style>{`
          .login-container input {
            background-color: white !important;
            color: black !important;
            border-color: #d1d5db !important;
          }
          .login-container input::placeholder {
            color: #6b7280 !important;
          }
          .login-container input:focus {
            background-color: white !important;
            color: black !important;
            border-color: #3b82f6 !important;
          }
          .login-container input:hover {
            background-color: #f9fafb !important;
          }
        `}</style>
        
        {/* Role Toggle */}
        <div className="relative flex gap-4 mb-8 rounded-lg p-1 shadow-inner bg-gray-200">
          <div
            className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-lg transition-all duration-300 ease-out ${
              userRole === 'STUDENT' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 transform translate-x-0' : 'bg-gradient-to-r from-indigo-500 to-indigo-600 transform translate-x-full'
            }`}
          ></div>
          <button
            className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              userRole === 'STUDENT' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setUserRole('STUDENT')}
          >
            Student
          </button>
          <button
            className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              userRole === 'TEACHER' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setUserRole('TEACHER')}
          >
            Teacher
          </button>
        </div>

        {/* Main Container */}
        <div
          className={`relative rounded-xl shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] w-full max-w-4xl min-h-[480px] overflow-hidden transition-all duration-300 bg-white ${
            userRole === 'TEACHER' ? 'shadow-[0_14px_28px_rgba(0,100,0,0.25),0_10px_10px_rgba(0,80,0,0.22)]' : ''
          } ${isRightPanelActive ? 'right-panel-active' : ''}`}
        >
          {/* Sign Up Form */}
          <div
            className={`absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] w-1/2 left-0 ${
              isRightPanelActive ? 'opacity-100 z-[5] translate-x-full' : 'opacity-0 z-[1]'
            }`}
          >
            <form onSubmit={handleSignUp} className="flex flex-col items-center justify-center h-full px-12 text-center bg-white">
              <h1 className="font-bold mb-6 text-3xl text-black">Create Account</h1>
              
              {/* Error Display */}
              {error && (
                <div className="w-full mb-6 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <div className="w-full mb-6">
                <GoogleAuthButton
                  onSuccess={handleGoogleAuth}
                  onError={() => setError('Google authentication failed')}
                  isSignUp={true}
                  userRole={userRole}
                  onClick={handleGoogleAuth}
                />
              </div>
              
              <div className="w-full space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Name"
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 focus:shadow-sm bg-white text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white !bg-white !text-black ${
                      userRole === 'TEACHER' ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    value={signUpData.name}
                    onChange={handleSignUpInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 focus:shadow-sm bg-white text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white !bg-white !text-black ${
                      userRole === 'TEACHER' ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    value={signUpData.email}
                    onChange={handleSignUpInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 focus:shadow-sm bg-white text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white !bg-white !text-black ${
                      userRole === 'TEACHER' ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    value={signUpData.password}
                    onChange={handleSignUpInputChange}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !isSignUpFormValid()}
                className={`w-full mt-6 rounded-3xl border px-12 py-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  userRole === 'TEACHER' ? 'border-indigo-500 bg-indigo-500 focus:ring-indigo-500' : 'border-emerald-500 bg-emerald-500 focus:ring-emerald-500'
                }`}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
          </div>

          {/* Sign In Form */}
          <div
            className={`absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] w-1/2 left-0 z-[2] ${isRightPanelActive ? 'translate-x-full' : ''}`}
          >
            <form onSubmit={handleLogin} className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
              <h1 className="font-bold mb-6 text-3xl text-black">Sign in</h1>
              
              {/* Error Display */}
              {error && (
                <div className="w-full mb-6 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="w-full mb-6">
                <GoogleAuthButton
                  onSuccess={handleGoogleAuth}
                  onError={() => setError('Google authentication failed')}
                  isSignUp={false}
                  userRole={userRole}
                  onClick={handleGoogleAuth}
                />
              </div>
              
              <div className="w-full space-y-4">
                <div>
                  <label htmlFor="username" className="sr-only">Username</label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Username"
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm text-black !bg-white !text-black ${
                      userRole === 'TEACHER' ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    value={loginData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="sr-only">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 hover:bg-gray-50 focus:bg-white focus:shadow-sm text-black !bg-white !text-black ${
                      userRole === 'TEACHER' ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    value={loginData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
                className="text-gray-600 text-sm mt-4 hover:text-gray-900 hover:underline hover:scale-105 transition-all duration-300 ease-out"
              >
                Forgot your password?
              </a>
              
              <button
                type="submit"
                disabled={isLoading || !isLoginFormValid()}
                className={`w-full mt-6 rounded-3xl border px-12 py-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  userRole === 'TEACHER' ? 'border-indigo-500 bg-indigo-500 focus:ring-indigo-500' : 'border-emerald-500 bg-emerald-500 focus:ring-emerald-500'
                }`}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Overlay Container */}
          <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] z-[100] ${isRightPanelActive ? '-translate-x-full' : ''}`}>
            <div
              className={`relative -left-full h-full w-[200%] text-white transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                userRole === 'TEACHER' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
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
                  {userRole === 'TEACHER' ? 'Hello, Teacher!' : 'Hello, Friend!'}
                </h1>
                <p className="text-sm font-normal leading-5 tracking-wider my-5">
                  {userRole === 'TEACHER' 
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
                <h2 className="text-2xl font-bold mb-4 text-black">Reset Password</h2>
                <p className="text-gray-600 mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <form onSubmit={handleForgotPassword}>
                  <label htmlFor="forgot-email" className="sr-only">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white focus:shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-black"
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
                      disabled={isLoading}
                      className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        userRole === 'TEACHER' ? 'bg-indigo-500' : 'bg-emerald-500'
                      } hover:brightness-110 transition-all duration-300`}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
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