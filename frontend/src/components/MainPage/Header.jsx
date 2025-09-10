import React from 'react';
import { FaFire } from 'react-icons/fa';
import { STORAGE_KEYS } from '../../config';

const Header = ({ stats }) => {

  return (
    <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-8 gap-4">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-2 mb-1">
          <FaFire className="text-yellow-300" />
          <span className="text-sm font-medium">Current Streak</span>
        </div>
        <p className="text-2xl font-bold">{stats.streak} days</p>
      </div>
    </div>
  );
};

export default Header;
