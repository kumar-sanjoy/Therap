import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import RoleToggle from './RoleToggle';
import LoginContainer from './LoginContainer';
import ForgotPasswordModal from './ForgotPasswordModal';
import ResetPasswordModal from './ResetPasswordModal';

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [userRole, setUserRole] = useState('STUDENT');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse token from URL if on /reset-password
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (location.pathname === '/reset-password' && token) {
      setShowResetPassword(true);
    } else {
      setShowResetPassword(false);
    }
  }, [location]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="flex justify-center items-center flex-col min-h-screen font-sans bg-gray-100">
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
        
        <RoleToggle userRole={userRole} setUserRole={setUserRole} />
        
        <LoginContainer
          isRightPanelActive={isRightPanelActive}
          setIsRightPanelActive={setIsRightPanelActive}
          userRole={userRole}
          error={error}
          setError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          navigate={navigate}
          setShowForgotPassword={setShowForgotPassword}
        />

        <ForgotPasswordModal
          showForgotPassword={showForgotPassword}
          setShowForgotPassword={setShowForgotPassword}
          forgotPasswordEmail={forgotPasswordEmail}
          setForgotPasswordEmail={setForgotPasswordEmail}
          userRole={userRole}
          error={error}
          setError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        <ResetPasswordModal
          showResetPassword={showResetPassword}
          setShowResetPassword={setShowResetPassword}
          tokenFromUrl={new URLSearchParams(location.search).get('token') || ''}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
