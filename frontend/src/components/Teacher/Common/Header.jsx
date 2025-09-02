import React from 'react';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { STORAGE_KEYS } from '../../../config';
import flowLogo from '../../../assets/flow-main-nobg.png';

const Header = ({ 
  title = "Teacher Dashboard", 
  subtitle = "Manage and monitor student progress",
  showBackButton = false,
  onBackClick,
  onLogout,
  navigate
}) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <FaArrowLeft className="text-sm" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
            )}
            <img src={flowLogo} alt="FLOW Logo" className="h-8 sm:h-10 w-auto" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium text-sm"
            >
              <FaSignOutAlt className="text-sm" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
