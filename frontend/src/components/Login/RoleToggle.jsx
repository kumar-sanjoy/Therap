import React from 'react';

const RoleToggle = ({ userRole, setUserRole }) => {
  return (
    <div className="relative flex gap-4 mb-8 rounded-lg p-1 shadow-inner bg-gray-200">
      <div
        className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-lg transition-all duration-300 ease-out ${
          userRole === 'STUDENT' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 transform translate-x-0' : 'bg-gradient-to-r from-indigo-500 to-indigo-600 transform translate-x-full'
        }`}
      ></div>
      <button
        className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
          userRole === 'STUDENT' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
        }`}
        onClick={() => setUserRole('STUDENT')}
      >
        Student
      </button>
      <button
        className={`relative z-10 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
          userRole === 'TEACHER' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
        }`}
        onClick={() => setUserRole('TEACHER')}
      >
        Teacher
      </button>
    </div>
  );
};

export default RoleToggle;
