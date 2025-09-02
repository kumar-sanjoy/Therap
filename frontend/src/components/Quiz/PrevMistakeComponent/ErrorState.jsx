import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const ErrorState = ({ error, navigate }) => {
    const { isDarkMode } = useDarkTheme();

    if (!error) return null;

    return (
        <div className={`min-h-screen flex flex-col ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
        }`}>
            <div className={`fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${
                isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
            }`}>
                <div className="text-center">
                    <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                    <h2 className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>No Previous Mistakes</h2>
                    <p className={`mb-6 max-w-md ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{error}</p>
                    <button 
                        className={`px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md ${
                            isDarkMode 
                                ? 'bg-white hover:bg-gray-100 text-gray-900' 
                                : 'bg-[#343434] hover:bg-gray-800 text-white'
                        }`}
                        onClick={() => navigate('/main')}
                    >
                        Go Back to Main
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorState;
