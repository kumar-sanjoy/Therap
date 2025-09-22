import React from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config';

const ForgotPasswordModal = ({
  showForgotPassword,
  setShowForgotPassword,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  userRole,
  error,
  setError,
  isLoading,
  setIsLoading
}) => {
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORGOT_PASSWORD}?email=${encodeURIComponent(forgotPasswordEmail)}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      const data = await response.json();

      if (response.ok) {
        setError('Password reset instructions sent to your email');
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        // Show user-friendly error messages for password reset
        if (response.status === 404) {
          setError('No account found with this email address. Please check your email or sign up for a new account.');
        } else if (response.status === 400) {
          setError('Please enter a valid email address.');
        } else {
          setError('Unable to process password reset request. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.message && err.message.includes('401')) {
        setError('Authentication failed. Please check your email address and try again.');
      } else if (err.message && err.message.includes('404')) {
        setError('No account found with this email address. Please check your email or sign up for a new account.');
      } else {
        setError('Unable to process password reset request. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForgotPassword) return null;

  return (
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
  );
};

export default ForgotPasswordModal;
