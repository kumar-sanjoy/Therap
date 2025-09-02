import React from 'react';
import { FaUsers, FaTrophy, FaStar, FaLightbulb, FaBullseye } from 'react-icons/fa';

const DashboardStats = ({ stats, onCategoryClick }) => {
  const statCards = [
    {
      key: 'totalStudents',
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: 'Active learners',
      icon: FaUsers,
      color: 'text-blue-500',
      hoverColor: 'hover:border-blue-300',
      onClick: () => onCategoryClick('all', 'All Students')
    },
    {
      key: 'averageAccuracy',
      title: 'Avg Accuracy',
      value: `${stats.averageAccuracy}%`,
      subtitle: 'Class average',
      icon: FaBullseye,
      color: 'text-green-500',
      hoverColor: 'hover:border-green-300',
      onClick: null
    },
    {
      key: 'highPerformers',
      title: 'High Performers',
      value: stats.highPerformers,
      subtitle: '80%+ accuracy',
      icon: FaTrophy,
      color: 'text-yellow-500',
      hoverColor: 'hover:border-yellow-300',
      onClick: () => onCategoryClick('high', 'High Performers')
    },
    {
      key: 'mediumPerformers',
      title: 'Medium',
      value: stats.mediumPerformers,
      subtitle: '50-79% accuracy',
      icon: FaStar,
      color: 'text-blue-500',
      hoverColor: 'hover:border-blue-300',
      onClick: () => onCategoryClick('medium', 'Medium Performers')
    },
    {
      key: 'lowPerformers',
      title: 'Need Support',
      value: stats.lowPerformers,
      subtitle: 'Below 50% accuracy',
      icon: FaLightbulb,
      color: 'text-red-500',
      hoverColor: 'hover:border-red-300',
      onClick: () => onCategoryClick('low', 'Students Needing Support')
    }
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.key}
            onClick={card.onClick}
            className={`bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 ${
              card.onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''
            } ${card.hoverColor}`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">{card.title}</h3>
              <Icon className={`text-lg sm:text-2xl ${card.color}`} />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
