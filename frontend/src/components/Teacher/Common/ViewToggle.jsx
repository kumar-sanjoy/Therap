import React from 'react';
import { FaTh, FaTable } from 'react-icons/fa';

const ViewToggle = ({ currentView, onViewChange }) => {
  const views = [
    {
      key: 'grid',
      label: 'Grid View',
      icon: FaTh,
      description: 'Card layout'
    },
    {
      key: 'table',
      label: 'Table View',
      icon: FaTable,
      description: 'Sortable table'
    }
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-300">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.key;
        
        return (
          <button
            key={view.key}
            onClick={() => onViewChange(view.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            title={view.description}
          >
            <Icon className="text-sm" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
