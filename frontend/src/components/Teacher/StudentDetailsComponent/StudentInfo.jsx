import React from 'react';
import { FaUserGraduate } from 'react-icons/fa';

const StudentInfo = ({ studentName }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
      <div className="flex items-center gap-3 mb-4">
        <FaUserGraduate className="text-indigo-600 text-xl" />
        <h3 className="text-xl font-bold text-gray-800">Student Information</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <p className="text-sm text-gray-600 font-medium">Student Name</p>
          <p className="text-lg font-semibold text-gray-800">{studentName}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;
