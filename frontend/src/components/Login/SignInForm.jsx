import React, { useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../../config';
import GoogleAuthButton from './GoogleAuthButton';

const SignInForm = ({ 
  isRightPanelActive, 
  userRole, 
  error, 
  setError, 
  isLoading, 
  setIsLoading,
  navigate,
  setShowForgotPassword,
  handleGoogleAuth,
  showCustomAlert
}) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const isLoginFormValid = () => {
    return loginData.username.trim() && loginData.password.trim() && !loginData.password.includes(' ');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent spaces in password field
    if (name === 'password' && value.includes(' ')) {
      showCustomAlert('Password cannot contain spaces. Please remove any spaces from your password.', 'warning');
      return;
    }
    
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Trim whitespace from username before sending to backend
    const trimmedUsername = loginData.username.trim();
    
    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;

    // Debug: Log the login request data
    console.log('🔍 [LOGIN DEBUG] Login request:', {
      username: trimmedUsername,
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
          username: trimmedUsername, 
          password: loginData.password,
          role: userRole 
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed. Please try again.';
        
        // Handle specific error status codes
        if (response.status === 401) {
          errorMessage = 'Invalid username or password. Please check your credentials and try again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please check your credentials and try again.';
        } else if (response.status === 404) {
          errorMessage = 'Account not found. Please check your username or sign up for a new account.';
        } else if (response.status === 400) {
          errorMessage = 'Please fill in all required fields correctly.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        // Try to get more specific error message from response
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          // If we can't parse JSON, use the default error message
          console.log('Could not parse error response as JSON');
        }
        
        showCustomAlert(errorMessage, 'error');
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
        showCustomAlert('Unable to connect to the server. Please check your internet connection and try again.', 'error');
      } else if (err.message && err.message.includes('401')) {
        showCustomAlert('Invalid username or password. Please check your credentials and try again.', 'error');
      } else {
        showCustomAlert('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] w-1/2 left-0 z-[5] ${isRightPanelActive ? 'translate-x-full' : ''}`}
    >
      <form onSubmit={handleLogin} className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
        <h1 className="font-bold mb-6 text-3xl text-black">Sign in</h1>
        


        <div className="w-full mb-6">
          <GoogleAuthButton
            onSuccess={handleGoogleAuth}
            onError={() => showCustomAlert('Google authentication failed', 'error')}
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
  );
};

export default SignInForm;
