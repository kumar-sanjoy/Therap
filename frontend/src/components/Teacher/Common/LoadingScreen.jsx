import React from 'react';
import { FaUsers } from 'react-icons/fa';

const LoadingScreen = ({ title = "Loading Student Data", message = "Please wait while we fetch your dashboard..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <FaUsers className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-lg" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  </div>
);

export default LoadingScreen;
