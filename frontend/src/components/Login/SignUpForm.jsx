import React, { useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config';
import GoogleAuthButton from './GoogleAuthButton';

const SignUpForm = ({ 
  isRightPanelActive, 
  userRole, 
  error, 
  setError, 
  isLoading, 
  setIsLoading,
  handleGoogleAuth,
  setIsRightPanelActive,
  showCustomAlert
}) => {
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' });

  const isSignUpFormValid = () => {
    return signUpData.name.trim() && signUpData.email.trim() && signUpData.password.trim() && !signUpData.password.includes(' ');
  };

  const handleSignUpInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent spaces in password field
    if (name === 'password' && value.includes(' ')) {
      showCustomAlert('Password cannot contain spaces. Please remove any spaces from your password.', 'warning');
      return;
    }
    
    setSignUpData({ ...signUpData, [name]: value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Trim whitespace from name before sending to backend
    const trimmedName = signUpData.name.trim();

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
          username: trimmedName, 
          email: signUpData.email, 
          password: signUpData.password, 
          ROLE: userRole 
        }),
      });

      // Handle 409 status immediately before trying to parse JSON
      if (response.status === 409) {
        showCustomAlert('An account with this email address already exists. Please use a different email or try signing in instead.', 'error');
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        // If JSON parsing fails but we have a specific status code, handle it
        if (response.status === 400) {
          showCustomAlert('Please fill in all required fields correctly.', 'error');
        } else if (response.status === 403) {
          showCustomAlert('Unable to connect to the server. Please try again later.', 'error');
        } else {
          showCustomAlert('Account creation failed. Please try again.', 'error');
        }
        return;
      }

      if (response.ok) {
        showCustomAlert('Account created successfully! Please check your email and click the confirmation link to activate your account.', 'success');
        // Slide to sign-in panel instead of navigating
        setIsRightPanelActive(false);
      } else {
        // Show user-friendly error messages for signup
        if (response.status === 400) {
          showCustomAlert('Please fill in all required fields correctly.', 'error');
        } else if (response.status === 403) {
          showCustomAlert('Unable to connect to the server. Please try again later.', 'error');
        } else {
          showCustomAlert('Account creation failed. Please try again.', 'error');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        showCustomAlert('Unable to connect to the server. Please check your internet connection and try again.', 'error');
      } else if (err.message && err.message.includes('401')) {
        showCustomAlert('Authentication failed. Please check your credentials and try again.', 'error');
      } else if (err.message && err.message.includes('409')) {
        showCustomAlert('An account with this email address already exists. Please use a different email or try signing in instead.', 'error');
      } else {
        showCustomAlert('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] w-1/2 left-0 ${
        isRightPanelActive ? 'opacity-100 z-[10] translate-x-full' : 'opacity-0 z-[1]'
      }`}
    >
      <form onSubmit={handleSignUp} className="flex flex-col items-center justify-center h-full px-12 text-center bg-white">
        <h1 className="font-bold mb-6 text-3xl text-black">Create Account</h1>
        

        
        <div className="w-full mb-6">
          <GoogleAuthButton
            onSuccess={handleGoogleAuth}
            onError={() => showCustomAlert('Google authentication failed', 'error')}
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
            <p className="text-xs text-gray-500 mt-1">Password cannot contain spaces</p>
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
  );
};

export default SignUpForm;
