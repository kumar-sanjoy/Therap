import React from 'react';
import { FaGoogle } from 'react-icons/fa';

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

export default GoogleAuthButton;
