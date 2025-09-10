import React from 'react';

const PerformanceIndicator = ({ correct, total, size = "md" }) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const radius = size === "sm" ? 25 : size === "lg" ? 40 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (percent) => {
    if (percent >= 80) return "text-green-500 stroke-green-500";
    if (percent >= 50) return "text-blue-500 stroke-blue-500";
    return "text-red-500 stroke-red-500";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg 
        className={`transform -rotate-90 ${size === "sm" ? "w-12 h-12" : size === "lg" ? "w-20 h-20" : "w-16 h-16"}`}
        viewBox={`0 0 ${(radius + 10) * 2} ${(radius + 10) * 2}`}
      >
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${getColor(percentage)}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${getColor(percentage)} ${size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm"}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default PerformanceIndicator;
