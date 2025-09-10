import React from 'react';
import { FaPen } from 'react-icons/fa';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import { useLocation } from 'react-router-dom';

const PageHeader = () => {
    const { isDarkMode } = useDarkTheme();
    const location = useLocation();

    const className = location.state?.className || location.state?.class || 'Class 9';
    const subject = location.state?.subject || 'Science';
    const chapter = location.state?.chapter || '1';

    return (
        <div className="text-center mb-8">
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${
                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
            }`}>
                <FaPen className={isDarkMode ? 'text-gray-200' : 'text-[#343434]'} />
                {`${className} · ${subject} · Chapter ${chapter}`}
            </h1>
            <p className={`text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Upload a photo of your handwritten answer for evaluation</p>
        </div>
    );
};

export default PageHeader;
