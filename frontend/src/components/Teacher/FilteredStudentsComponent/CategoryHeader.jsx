import React from 'react';

const CategoryHeader = ({ categoryConfig, studentCount }) => {
  const CategoryIcon = categoryConfig.icon;

  return (
    <div className={`${categoryConfig.bgColor} ${categoryConfig.borderColor} border rounded-2xl p-6 mb-6 sm:mb-8`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${categoryConfig.bgColor.replace('bg-', 'bg-').replace('-50', '-100')}`}>
          <CategoryIcon className={`text-2xl ${categoryConfig.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{categoryConfig.title}</h2>
          <p className="text-sm sm:text-base text-gray-600">{categoryConfig.description}</p>
          <p className="text-sm text-gray-500 mt-1">{studentCount} student{studentCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;
