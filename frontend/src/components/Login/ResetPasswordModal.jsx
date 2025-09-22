import React, { useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config';

const ResetPasswordModal = ({ showResetPassword, setShowResetPassword, tokenFromUrl }) => {
  const [token, setToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESET_PASSWORD}?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      const data = await response.text();
      if (response.ok) {
        setSuccess(true);
        setError('');
      } else {
        setError(data || 'Unable to reset password. Please try again.');
      }
    } catch (err) {
      setError('Unable to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showResetPassword) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <h2 className="text-2xl font-bold mb-4 text-black">Reset Password</h2>
        {success ? (
          <p className="text-green-600 mb-4">Password has been reset successfully. You can now log in with your new password.</p>
        ) : (
          <form onSubmit={handleResetPassword}>
            <label htmlFor="reset-token" className="block mb-2 text-black">Reset Token</label>
            <input
              id="reset-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your reset token"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white focus:shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-black"
              required
            />
            <label htmlFor="new-password" className="block mb-2 text-black">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 text-black placeholder-gray-500 hover:bg-gray-50 focus:bg-white focus:shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-black"
              required
            />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-white rounded-lg bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-300"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
