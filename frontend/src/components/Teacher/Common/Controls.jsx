import React from 'react';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const Controls = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  sortOrder,
  onSort,
  filterPerformance = 'all',
  setFilterPerformance = null,
  searchPlaceholder = "Search students...",
  showPerformanceFilter = true
}) => {
  const getSortIcon = (key) => {
    if (sortBy !== key) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-indigo-600" /> : <FaSortDown className="text-indigo-600" />;
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
      <div className="flex flex-col gap-4">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Performance Filter */}
          {showPerformanceFilter && setFilterPerformance && (
            <select
              value={filterPerformance}
              onChange={(e) => setFilterPerformance(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-0"
            >
              <option value="all">All Performance Levels</option>
              <option value="high">High Performers (80%+)</option>
              <option value="medium">Medium Performers (50-80%)</option>
              <option value="low">Need Support (&lt;50%)</option>
            </select>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => onSort('studentId')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm md:text-base min-w-fit whitespace-nowrap ${
              sortBy === 'studentId' 
                ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="hidden md:inline">Name</span>
            <span className="hidden sm:inline md:hidden">Name</span>
            <span className="sm:hidden">Name</span>
            {getSortIcon('studentId')}
          </button>
          <button
            onClick={() => onSort('totalQuestions')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm md:text-base min-w-fit whitespace-nowrap ${
              sortBy === 'totalQuestions' 
                ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="hidden md:inline">Questions</span>
            <span className="hidden sm:inline md:hidden">Questions</span>
            <span className="sm:hidden">Q's</span>
            {getSortIcon('totalQuestions')}
          </button>
          <button
            onClick={() => onSort('performance')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm md:text-base min-w-fit whitespace-nowrap ${
              sortBy === 'performance' 
                ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="hidden md:inline">Performance</span>
            <span className="hidden sm:inline md:hidden">Performance</span>
            <span className="sm:hidden">Perf</span>
            {getSortIcon('performance')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
