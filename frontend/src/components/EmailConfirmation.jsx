import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import flowLogo from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import { useDarkTheme } from './DarkThemeProvider';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Invalid confirmation link. Token is missing.');
          setIsLoading(false);
          return;
        }

        console.log('🔍 [EMAIL_CONFIRMATION DEBUG] Confirming email with token:', token);
        
        // Make GET request to backend with the token
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONFIRM_EMAIL}?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
          },
          mode: 'cors',
          credentials: 'include',
        });

        console.log('🔍 [EMAIL_CONFIRMATION DEBUG] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage(data.message || 'Email confirmed successfully! You can now sign in to your account.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatus('error');
          setMessage(errorData.message || 'Email confirmation failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('🔍 [EMAIL_CONFIRMATION DEBUG] Error confirming email:', error);
        setStatus('error');
        setMessage('Unable to confirm email. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'}`}>
      {/* Header */}
      <header className={`w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${isDarkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-100 bg-gradient-to-r from-white to-gray-50/50'}`}>
        <img src={isDarkMode ? flowLogoDark : flowLogo} alt="FLOW Logo" className="h-10" />
        <button 
          className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-[#343434] hover:text-white'
          }`}
          onClick={handleBackToLogin}
        >
          <IoMdArrowRoundBack />
          Back to Login
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md mx-auto">
          <div className={`rounded-2xl shadow-xl border p-8 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {isLoading ? (
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin"></div>
              ) : status === 'success' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-2xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-[#343434]'}`}>
              {isLoading ? 'Confirming Email...' : 
               status === 'success' ? 'Email Confirmed!' : 
               'Confirmation Failed'}
            </h1>

            {/* Message */}
            <p className={`text-center mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isLoading ? 'Please wait while we confirm your email address...' : message}
            </p>

            {/* Action Buttons */}
            {!isLoading && (
              <div className="space-y-3">
                {status === 'success' ? (
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-[#343434] hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#343434] focus:ring-offset-2"
                  >
                    Sign In Now
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleRetry}
                      className="w-full bg-[#343434] hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#343434] focus:ring-offset-2"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleBackToLogin}
                      className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isDarkMode 
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 focus:ring-gray-400' 
                          : 'bg-gray-100 hover:bg-gray-200 text-[#343434] focus:ring-gray-300'
                      }`}
                    >
                      Back to Login
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            {status === 'error' && (
              <div className={`mt-6 p-4 border rounded-lg ${
                isDarkMode 
                  ? 'bg-yellow-900/50 border-yellow-700' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                  <strong>Need help?</strong> If you're having trouble confirming your email, please check your spam folder or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmation; 