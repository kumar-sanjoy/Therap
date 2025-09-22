import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import TextDisplay from '../../Common/TextDisplay';

const AnalysisReport = ({ report }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-green-600 dark:text-green-400 text-xl" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Performance Analysis</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <TextDisplay 
            content={report} 
            isUserMessage={false} 
            forceBlackText={false}
            fontSize={16}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
