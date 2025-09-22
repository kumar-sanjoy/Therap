import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { API_BASE_URL, API_ENDPOINTS } from '../../config';
import flowLogo from '../../assets/flow-main-nobg.png';
import flowLogoDark from '../../assets/flow-dark.png';
import { useDarkTheme } from '../Common/DarkThemeProvider';



// Simple function to test backend connectivity (only in development)
const testBackendConnectivity = async () => {
  if (process.env.NODE_ENV === 'development') {
              }
};

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    // Run backend connectivity test
    testBackendConnectivity();
    
    const confirmEmail = async () => {
      setIsLoading(true);
      setMessage(''); // Clear previous messages
      setStatus('loading');

      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Invalid confirmation link. Token is missing. Please check your email for the correct confirmation link.');
          setIsLoading(false);
          return;
        }

        // Use the correct backend endpoint
        const confirmUrl = `${API_BASE_URL}${API_ENDPOINTS.CONFIRM_EMAIL}?token=${token}`;
        
                    
        // Try different fetch configurations to handle CORS issues
        let response = null;
        let fetchError = null;
        
        // First try: Standard fetch with CORS
        try {
          response = await fetch(confirmUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors',
          });
        } catch (error) {
          fetchError = error;
                    }
        
        // Second try: Without Content-Type header (some servers reject it for GET requests)
        if (!response || response.status === 403) {
          try {
                          response = await fetch(confirmUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              mode: 'cors',
            });
          } catch (error) {
            fetchError = error;
                        }
        }
        
        // Third try: Without any custom headers
        if (!response || response.status === 403) {
          try {
                          response = await fetch(confirmUrl, {
              method: 'GET',
              mode: 'cors',
            });
          } catch (error) {
            fetchError = error;
                        }
        }
        
        // Fourth try: Without CORS mode (for servers without CORS configuration)
        if (!response || response.status === 403) {
          try {
                          response = await fetch(confirmUrl, {
              method: 'GET',
            });
          } catch (error) {
            fetchError = error;
                        }
        }
        
        // If all fetch attempts failed, throw the error
        if (!response && fetchError) {
          throw fetchError;
        }

                                                
        // Additional debugging for 403 errors
        if (response.status === 403) {
                                              
          // Try to get response text for debugging
          try {
            const responseText = await response.text();
                        } catch (textError) {
                        }
        }

        if (response.ok) {
          try {
            const data = await response.json();
                          setStatus('success');
            setMessage(data.message || 'Your email has been successfully confirmed! Welcome to FLOW!');
          } catch (jsonError) {
                                        
            // Try to get response text for debugging
            try {
              const responseText = await response.text();
                            } catch (textError) {
                            }
            
            setStatus('success');
            setMessage('Your email has been successfully confirmed! Welcome to FLOW!');
          }
          
          // Start countdown and redirect
          let countdown = 3;
          const countdownInterval = setInterval(() => {
            countdown--;
            setRedirectCountdown(countdown);
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              navigate('/login');
            }
          }, 1000);
        } else {
          let errorMessage = 'Email confirmation failed. The link may be expired or invalid.';
          
          try {
            const errorData = await response.json();
                          errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (jsonError) {
                                        
            // Try to get response text for debugging
            try {
              const responseText = await response.text();
                            } catch (textError) {
                            }
          }
          
          // Provide user-friendly error messages
          if (response.status === 401) {
            errorMessage = 'This confirmation link has expired or is invalid. Please request a new confirmation email.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. This confirmation link may have expired or the server is rejecting the request. Please try requesting a new confirmation email.';
          } else if (response.status === 404) {
            errorMessage = 'This confirmation link is no longer valid. Please check your email for the most recent confirmation link.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid confirmation link. Please check your email and click the correct link.';
          } else if (response.status === 500) {
            errorMessage = 'We\'re experiencing technical difficulties. Please try again in a few minutes.';
          } else if (response.status === 0) {
            errorMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
          }
          
                                  setStatus('error');
          setMessage(errorMessage);
        }
      } catch (error) {
        console.error('🔍 [EMAIL CONFIRMATION DEBUG] Exception:', error);
        console.error('🔍 [EMAIL CONFIRMATION DEBUG] Error name:', error.name);
        console.error('🔍 [EMAIL CONFIRMATION DEBUG] Error message:', error.message);
        
        let errorMessage = 'We couldn\'t confirm your email at this time. Please try again.';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
        } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.name === 'SyntaxError') {
          errorMessage = 'The server returned an invalid response. This might be a temporary issue. Please try again.';
        }
        
        setStatus('error');
        setMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmail();
    
    // Cleanup function to clear any intervals when component unmounts
    return () => {
      // This will be called when the component unmounts
    };
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
              {isLoading ? 'Confirming Your Email...' : 
               status === 'success' ? 'Email Confirmed Successfully!' : 
               'Confirmation Failed'}
            </h1>

            {/* Message */}
            <p className={`text-center mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isLoading ? 'Please wait while we verify your email address and activate your account...' : message}
            </p>

            {/* Action Buttons */}
            {!isLoading && (
              <div className="space-y-3">
                {status === 'success' ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-3">
                        You'll be redirected to sign in {redirectCountdown > 0 ? `in ${redirectCountdown} second${redirectCountdown !== 1 ? 's' : ''}` : 'now'}...
                      </p>
                      <button
                        onClick={handleBackToLogin}
                        className="w-full bg-[#343434] hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#343434] focus:ring-offset-2 text-lg"
                      >
                        Sign In Now
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      Welcome to FLOW! Your account is now ready.
                    </p>
                  </div>
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
                      Go to Sign In
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            {status === 'error' && (
              <div className={`mt-6 p-4 border rounded-lg ${
                isDarkMode 
                  ? 'bg-blue-900/50 border-blue-700' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>Need help?</strong> If you're having trouble confirming your email:
                </p>
                <ul className={`text-sm mt-2 space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you clicked the link from your most recent email</li>
                  <li>• Try requesting a new confirmation email</li>
                  <li>• If you're getting "Access denied" errors, try clicking the link again</li>
                  <li>• Contact our support team if the problem persists</li>
                </ul>
                
                {/* Debug buttons - only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={testBackendConnectivity}
                      className={`w-full px-4 py-2 text-sm border rounded-lg transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Test Backend Connection
                    </button>
                    <button
                      onClick={() => {
                        const currentUrl = window.location.href;
                        const token = searchParams.get('token');
                        const confirmUrl = `${API_BASE_URL}${API_ENDPOINTS.CONFIRM_EMAIL}?token=${token}`;
                        const message = `Current URL: ${currentUrl}\nToken: ${token}\nAPI Base: ${API_BASE_URL}\nStatus: ${status}\nCountdown: ${redirectCountdown}\n\nConfirmation URL: ${confirmUrl}`;
                        alert(message);
                      }}
                      className={`w-full px-4 py-2 text-sm border rounded-lg transition-all ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-gray-200 hover:bg-gray-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Debug Current State
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmation; 