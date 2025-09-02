import React from 'react';
import { FaPen } from 'react-icons/fa';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const PageHeader = () => {
    const { isDarkMode } = useDarkTheme();

    return (
        <div className="text-center mb-8">
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${
                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
            }`}>
                <FaPen className={isDarkMode ? 'text-gray-200' : 'text-[#343434]'} />
                Written Question Practice
            </h1>
            <p className={`text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Upload a photo of your handwritten answer for evaluation</p>
        </div>
    );
};

export default PageHeader;
