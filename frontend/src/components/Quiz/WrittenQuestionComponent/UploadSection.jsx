import React from 'react';
import { FaUpload } from 'react-icons/fa';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

const UploadSection = ({ 
    onImageChange, 
    image, 
    previewURL, 
    onRemoveImage, 
    isSubmitting, 
    isLoadingQuestion 
}) => {
    const { isDarkMode } = useDarkTheme();

    return (
        <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-8 ${
            isDarkMode 
                ? 'bg-gray-800/80 border-gray-700' 
                : 'bg-white/80 border-gray-200'
        }`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
            }`}>
                <FaUpload className={isDarkMode ? 'text-gray-200' : 'text-[#343434]'} />
                Upload Your Answer
            </h2>
            
            {/* File Upload Area */}
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${
                isDarkMode 
                    ? 'border-gray-600 hover:border-gray-400' 
                    : 'border-gray-300 hover:border-[#343434]'
            }`}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={isSubmitting || isLoadingQuestion}
                />
                <label htmlFor="image-upload" className={`${isLoadingQuestion ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <div className="flex flex-col items-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                            <FaUpload className={`w-8 h-8 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-400'
                            }`} />
                        </div>
                        <div>
                            <p className={`text-lg font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                {isLoadingQuestion ? 'Loading question...' : image ? 'Image uploaded successfully!' : 'Click to upload image'}
                            </p>
                            <p className={`text-sm mt-1 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                                {isLoadingQuestion ? 'Please wait while we load your question' : image ? image.name : 'PNG, JPG, JPEG up to 5MB'}
                            </p>
                        </div>
                    </div>
                </label>
            </div>

            {/* Image Preview */}
            {previewURL && (
                <div className="mt-6">
                    <div className={`relative rounded-xl p-4 border ${
                        isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-lg font-semibold ${
                                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                            }`}>Preview</h3>
                            <button
                                onClick={onRemoveImage}
                                className="text-red-500 hover:text-red-700 hover:scale-105 text-sm font-medium"
                            >
                                Remove
                            </button>
                        </div>
                        <div className="relative">
                            <img 
                                src={previewURL} 
                                alt="Answer Preview" 
                                className="w-full max-h-96 object-contain rounded-lg shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadSection;
