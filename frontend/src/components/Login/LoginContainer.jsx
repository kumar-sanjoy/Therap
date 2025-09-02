import React, { useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';
import OverlayContainer from './OverlayContainer';
import CustomAlert from '../Common/CustomAlert';

const LoginContainer = ({
  isRightPanelActive,
  setIsRightPanelActive,
  userRole,
  error,
  setError,
  isLoading,
  setIsLoading,
  navigate,
  setShowForgotPassword
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');

  const showCustomAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const hideCustomAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
  };

  // Determine if user is signing up or signing in based on panel state
  const getLoadingText = () => {
    if (isRightPanelActive) {
      return userRole === 'TEACHER' ? 'Creating Teacher Account...' : 'Creating Student Account...';
    } else {
      return 'Signing In...';
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
        setError('Unable to connect to Google authentication. Please try again later.');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.message && err.message.includes('401')) {
        setError('Google authentication failed. Please try again or use email/password login.');
      } else {
        setError('Unable to connect to Google authentication. Please try again later.');
      }
    }
  };

  return (
    <div
      className={`relative rounded-xl shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] w-full max-w-4xl min-h-[480px] overflow-hidden transition-all duration-300 bg-white ${
        userRole === 'TEACHER' ? 'shadow-[0_14px_28px_rgba(0,100,0,0.25),0_10px_10px_rgba(0,80,0,0.22)]' : ''
      }`}
    >
      <SignUpForm
        isRightPanelActive={isRightPanelActive}
        userRole={userRole}
        error={error}
        setError={setError}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        handleGoogleAuth={handleGoogleAuth}
        setIsRightPanelActive={setIsRightPanelActive}
        showCustomAlert={showCustomAlert}
      />

      <SignInForm
        isRightPanelActive={isRightPanelActive}
        userRole={userRole}
        error={error}
        setError={setError}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        navigate={navigate}
        setShowForgotPassword={setShowForgotPassword}
        handleGoogleAuth={handleGoogleAuth}
        showCustomAlert={showCustomAlert}
      />

      <OverlayContainer
        isRightPanelActive={isRightPanelActive}
        userRole={userRole}
        setIsRightPanelActive={setIsRightPanelActive}
      />

      {/* Custom Alert - rendered at container level */}
      <CustomAlert
        message={alertMessage}
        type={alertType}
        isVisible={showAlert}
        onClose={hideCustomAlert}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[9998]">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            userRole === 'TEACHER' ? 'border-indigo-500' : 'border-emerald-500'
          }`}></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {getLoadingText()}
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we process your request
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginContainer;
