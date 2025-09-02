import React from 'react';
import { FaChartLine } from 'react-icons/fa';

const AnalysisReport = ({ report }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-green-600 text-xl" />
          <h3 className="text-xl font-bold text-gray-800">Performance Analysis</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
            {report}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
