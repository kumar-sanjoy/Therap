import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import flowLogoLight from '../../../assets/flow-main-nobg.png';
import flowLogoDark from '../../../assets/flow-dark.png';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const Header = ({ navigate }) => {
    const { isDarkMode } = useDarkTheme();

    return (
        <header className={`w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${
            isDarkMode 
                ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900/50' 
                : 'border-gray-100 bg-gradient-to-r from-white to-gray-50/50'
        }`}>
            <img src={isDarkMode ? flowLogoDark : flowLogoLight} alt="FLOW Logo" className="h-10" />
            <button 
                className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-[#343434] hover:text-white'
                }`}
                onClick={() => navigate('/main')}
            >
                <IoMdArrowRoundBack />
                Back
            </button>
        </header>
    );
};

export default Header;
