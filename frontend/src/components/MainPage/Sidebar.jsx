import React, { useState } from 'react';
import { 
  FaBook, FaPen, FaChevronLeft, FaChevronRight, 
  FaSignOutAlt, FaQuestionCircle, FaStickyNote, 
  FaHistory, FaUserGraduate
} from 'react-icons/fa';
import { LuNotebookPen } from "react-icons/lu";
import ThemeToggle from '../Common/ThemeToggle';
import MentorModal from './MentorModal';
import flowLogoLight from '../../assets/flow-main-nobg.png';
import flowLogoDark from '../../assets/flow-dark.png';

const Sidebar = ({
  isSidebarOpen,
  sidebarWidth,
  sidebarOverlay,
  isDarkMode,
  isMobile,
  toggleSidebar,
  handleNavigation,
  handleLogout,
  navigate,
  mentor,
  onMentorChange
}) => {
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  
  const sidebarHighlight = !isSidebarOpen && (isSidebarHovered || isLogoHovered) ? 'bg-gray-100 border-r-2 border-gray-300' : '';

  const renderNavigationButton = (item) => {
    const IconComponent = item.icon;
    let buttonClasses = '';
    let iconClasses = '';
    
    // Define classes based on item type
    if (item.key === 'learn') {
      buttonClasses = 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300';
      iconClasses = 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 text-blue-600 dark:text-blue-400';
    } else if (item.key === 'mcq') {
      buttonClasses = 'hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300';
      iconClasses = 'bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/40 text-violet-600 dark:text-violet-400';
    } else if (item.key === 'written') {
      buttonClasses = 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300';
      iconClasses = 'bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 text-green-600 dark:text-green-400';
    } else if (item.key === 'notes') {
      buttonClasses = 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-700 dark:hover:text-yellow-300';
      iconClasses = 'bg-yellow-100 dark:bg-yellow-900/30 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 text-yellow-600 dark:text-yellow-400';
    } else if (item.key === 'revise') {
      buttonClasses = 'hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300';
      iconClasses = 'bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 text-orange-600 dark:text-orange-400';
    } else if (item.key === 'ask') {
      buttonClasses = 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-300';
      iconClasses = 'bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/40 text-cyan-600 dark:text-cyan-400';
    }

    return (
      <button 
        key={item.key}
        onClick={item.onClick} 
        className={`w-full p-4 flex items-center rounded-xl transition-all duration-200 mb-2 group ${buttonClasses}`}
        aria-label={item.label}
      >
        <div className={`p-2 rounded-lg transition-colors duration-200 ${iconClasses}`}>
          <IconComponent className="text-lg" />
        </div>
        {isSidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
      </button>
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarWidth} shadow-xl z-30 
        ${sidebarHighlight} ${sidebarOverlay} border-r ${
        isDarkMode 
          ? 'bg-gray-800 text-gray-100 border-gray-700' 
          : 'bg-white text-[#343434] border-gray-100'
      }`}
      onMouseEnter={() => !isSidebarOpen && setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
      style={isMobile && !isSidebarOpen ? { display: 'none' } : {}}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        {/* Logo Container - now with hover effect */}
        <div 
          className={`flex items-center justify-center ${!isSidebarOpen ? 'hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl' : ''}`}
          onMouseEnter={() => !isSidebarOpen && setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          onClick={() => !isSidebarOpen && toggleSidebar()}
          style={{ 
            minHeight: '48px', 
            minWidth: '48px',
            transition: 'background-color 150ms ease-in-out'
          }}
        >
          {isSidebarOpen ? (
            <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="w-24 transition-all duration-300 ease-in-out" />
          ) : (
            isLogoHovered ? (
              <div className="p-2">
                <FaChevronRight className="text-2xl text-gray-600 dark:text-gray-300" />
              </div>
            ) : (
              <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="w-20 transition-all duration-300 ease-in-out" />
            )
          )}
        </div>
        {/* Toggle button - only shown when sidebar is open */}
        {isSidebarOpen && (
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-150"
            >
              <FaChevronLeft className="text-xl text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>
      
      <nav className="mt-6 flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-1 px-2">
          {/* Learning Section */}
          {isSidebarOpen && (
            <div className="px-4 py-2 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Learning</h3>
            </div>
          )}
          {renderNavigationButton({
            key: 'learn',
            label: 'Learn',
            icon: FaBook,
            onClick: () => handleNavigation('learn')
          })}
          {renderNavigationButton({
            key: 'mcq',
            label: 'Quiz',
            icon: LuNotebookPen,
            onClick: () => handleNavigation('mcq')
          })}
          {renderNavigationButton({
            key: 'written',
            label: 'Written Practice',
            icon: FaPen,
            onClick: () => handleNavigation('written')
          })}

          {/* Tools Section */}
          {isSidebarOpen && (
            <div className="px-4 py-2 mb-4 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tools</h3>
            </div>
          )}
          {renderNavigationButton({
            key: 'notes',
            label: 'Notes',
            icon: FaStickyNote,
            onClick: () => navigate('/note')
          })}
          {renderNavigationButton({
            key: 'revise',
            label: 'Revise',
            icon: FaHistory,
            onClick: () => navigate('/select', { state: { mode: 'revise' } })
          })}
          {renderNavigationButton({
            key: 'ask',
            label: 'Clear Doubt',
            icon: FaQuestionCircle,
            onClick: () => navigate('/ask')
          })}
        </div>
        
        {/* Mentor Section */}
        <div className="px-2 mb-2">
          <button
            onClick={() => setIsMentorModalOpen(true)}
            className={`w-full p-4 flex items-center rounded-xl border transition-colors duration-200 cursor-pointer ${
              mentor 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-800/30'
                : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              mentor 
                ? 'bg-indigo-100 dark:bg-indigo-900/30'
                : 'bg-gray-100 dark:bg-gray-700/50'
            }`}>
              <FaUserGraduate className={`text-lg ${
                mentor 
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            {isSidebarOpen && (
              <div className="ml-4">
                <div className={`text-xs font-semibold uppercase tracking-wider ${
                  mentor 
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>Mentor</div>
                <div className={`font-medium ${
                  mentor 
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {mentor || 'No Mentor Assigned'}
                </div>
              </div>
            )}
          </button>
        </div>
        
        {/* Logout Section */}
        <div className="px-2">
          <button onClick={handleLogout} className="w-full p-4 flex items-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 border-t border-gray-100 dark:border-gray-700 rounded-xl group">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-200">
              <FaSignOutAlt className="text-lg text-red-600 dark:text-red-400" />
            </div>
            {isSidebarOpen && <span className="ml-4 font-medium">Logout</span>}
          </button>
        </div>
      </nav>
      
      {/* Mentor Modal */}
      <MentorModal
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
        currentMentor={mentor}
        onMentorChange={onMentorChange}
      />
    </div>
  );
};

export default Sidebar;
