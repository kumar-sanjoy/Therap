import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUpload, FaCheckCircle, FaArrowLeft, FaPen } from 'react-icons/fa';
import { IoMdArrowRoundBack } from "react-icons/io";
import { API_BASE_URL, EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import { useDarkTheme } from './DarkThemeProvider';
import flowLogoLight from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import TextDisplay from "./TextDisplay";

const WrittenQuestion = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useDarkTheme();
    const [question, setQuestion] = useState(location.state?.question || '');
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(!location.state?.question);

    const [image, setImage] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [error, setError] = useState('');

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const role = localStorage.getItem(STORAGE_KEYS.ROLE);
        
        if (!token || !username) {
            navigate('/login');
            return;
        }
        
        // Check if user has the correct role for this page (WrittenQuestion is student-only)
        if (role !== 'STUDENT') {
            if (role === 'TEACHER') {
                navigate('/teacher');
            } else {
                navigate('/login');
            }
            return;
        }
    }, [navigate]);

    // Initialize question from location.state or fetch if not available
    useEffect(() => {
        // Check if question is passed from SelectSubject first
        const questionFromState = location.state?.question;
        if (questionFromState) {
            setQuestion(questionFromState);
            setIsLoadingQuestion(false);
            return;
        }

        // If no question from state, check if we need to fetch
        if (!question) {
            // Only fetch if question is not in state and not already set
            setIsLoadingQuestion(true);
            const className = location.state?.className || location.state?.class || 'Class 9';
            const subject = location.state?.subject || 'Science';
            const chapter = location.state?.chapter || '1';
            const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'default_user';
            const params = new URLSearchParams({
                username,
                className: mapClassForExamAPI(className),
                subject: mapSubjectForExamAPI(subject),
                chapter
            });
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.WRITTEN_QUESTION}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(data => {
                    setQuestion(data.question || data.questions?.[0]?.question || 'No question found.');
                    setIsLoadingQuestion(false);
                })
                .catch(() => {
                    setQuestion('No question found.');
                    setIsLoadingQuestion(false);
                });
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                setError("Image file is too large. Please select an image smaller than 5MB.");
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                setError("Please select a valid image file (JPG, PNG, JPEG).");
                return;
            }

            setImage(file);
            setPreviewURL(URL.createObjectURL(file));
            setError(''); // Clear any previous errors
        }
    };

    // Function to compress image
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions (max 1200px width/height)
                const maxSize = 1200;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, 'image/jpeg', 0.8); // 80% quality
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const handleSubmit = async () => {
        if (!image) {
            setError("Please upload an image of your written answer.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Compress image before sending
            const compressedImage = await compressImage(image);
            
            const formData = new FormData();
            formData.append("image", compressedImage, image.name);
            formData.append("question", question);

            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const res = await fetch(`${EXAM_API_BASE_URL}${API_ENDPOINTS.SUBMIT_WRITTEN}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Remove Content-Type - let browser set it automatically for FormData
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setFeedback(data.feedback || data.message || 'Submitted successfully!');
                setShowFeedback(true);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to submit answer');
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            
            // Check for specific error types
            if (error.name === 'TypeError' && error.message.includes('Load failed')) {
                setError('Network error: Unable to connect to the server. Please check your connection and try again.');
            } else if (error.message.includes('CORS')) {
                setError('CORS error: Server configuration issue. Please contact support.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        navigate('/main');
    };

    const removeImage = () => {
        setImage(null);
        setPreviewURL('');
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }
    };

    return (
        <div className={`min-h-screen ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-200'
        }`}>
            {/* Enhanced Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-50/95 via-white/95 to-green-50/95 backdrop-blur-lg flex flex-col items-center justify-center z-50">
                    <div className="relative flex flex-col items-center">
                        {/* Main Loading Container */}
                        <div className="relative mb-8">
                            {/* Outer Ring */}
                            <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin"></div>
                            {/* Middle Ring */}
                            <div className="absolute inset-2 w-20 h-20 border-4 border-green-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                            {/* Inner Ring */}
                            <div className="absolute inset-4 w-16 h-16 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                            {/* Center Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Loading Text */}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Answer</h3>
                            <p className="text-gray-600 text-lg">Our AI is carefully reviewing your handwritten response...</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Upload Complete</span>
                            </div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Processing Image</span>
                            </div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">AI Analysis</span>
                            </div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>

                        {/* Fun Facts */}
                        <div className="text-center">
                            <p className="text-sm text-gray-500 italic">Did you know? Our AI can analyze handwriting in multiple languages!</p>
                        </div>

                        {/* Floating Particles */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(12)].map((_, i) => (
                                <div 
                                    key={i}
                                    className="absolute rounded-full bg-gradient-to-r from-blue-400/30 to-green-400/30"
                                    style={{
                                        width: `${Math.random() * 8 + 4}px`,
                                        height: `${Math.random() * 8 + 4}px`,
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animation: `float ${Math.random() * 6 + 4}s linear infinite`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        opacity: 0.7
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Custom CSS Animations */}
                    <style>{`
                        @keyframes float {
                            0% { transform: translateY(0) translateX(0); opacity: 0.7; }
                            50% { transform: translateY(-30px) translateX(15px); opacity: 1; }
                            100% { transform: translateY(0) translateX(30px); opacity: 0.7; }
                        }
                    `}</style>
                </div>
            )}

            {/* Header */}
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

            {/* Main Content */}
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {/* Page Header */}
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

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Question Card */}
                <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-8 ${
                    isDarkMode 
                        ? 'bg-gray-800/80 border-gray-700' 
                        : 'bg-white/80 border-gray-200'
                }`}>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                    }`}>
                        <svg className={`w-5 h-5 ${
                            isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Question
                    </h2>
                    <div className={`rounded-xl p-6 border ${
                        isDarkMode 
                            ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600' 
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                    }`}>
                        {isLoadingQuestion ? (
                            <div className="flex items-center justify-center space-x-3">
                                <div className={`w-6 h-6 border-2 rounded-full animate-spin ${
                                    isDarkMode 
                                        ? 'border-gray-600 border-t-green-400' 
                                        : 'border-gray-300 border-t-green-500'
                                }`}></div>
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading question...</p>
                            </div>
                        ) : (
                            <p className={`text-lg leading-relaxed ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>{question}</p>
                        )}
                    </div>
                </div>

                {/* Upload Section */}
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
                            onChange={handleImageChange}
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
                                        onClick={removeImage}
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

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !image || isLoadingQuestion} 
                        className={`px-8 py-4 font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 ${
                            isDarkMode 
                                ? 'bg-white hover:bg-gray-100 text-gray-900' 
                                : 'bg-[#343434] hover:from-gray-800 hover:to-gray-900 text-white'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="w-5 h-5" />
                                <span>Submit Answer</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Feedback Section */}
                {showFeedback && (
                    <div className={`mt-8 backdrop-blur-sm rounded-2xl shadow-xl border p-6 ${
                        isDarkMode 
                            ? 'bg-gray-800/80 border-gray-700' 
                            : 'bg-white/80 border-gray-200'
                    }`}>
                        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                            isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                        }`}>
                            <svg className={`w-5 h-5 ${
                                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            AI Feedback
                        </h2>
                        <div className={`rounded-xl p-6 border ${
                            isDarkMode 
                                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
                                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        }`}>
                            <TextDisplay content={feedback} />
                        </div>
                        <div className="flex justify-center mt-6">
                            <button 
                                onClick={reset}
                                className={`px-6 py-3 border font-medium rounded-lg transition-all hover:shadow-md flex items-center space-x-2 ${
                                    isDarkMode 
                                        ? 'bg-white border-gray-300 hover:bg-gray-100 text-gray-900' 
                                        : 'bg-white border-gray-200 hover:bg-gray-50 text-[#343434]'
                                }`}
                            >
                                <IoMdArrowRoundBack className="w-4 h-4" />
                                <span>Back to Main</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WrittenQuestion;
