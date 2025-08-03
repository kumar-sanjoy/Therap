import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUpload, FaCheckCircle, FaArrowLeft, FaPen } from 'react-icons/fa';
import { IoMdArrowRoundBack } from "react-icons/io";
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';
import flowLogo from '../assets/flow-main-nobg.png';
import TextDisplay from "./TextDisplay";

const WrittenQuestion = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [question, setQuestion] = useState(location.state?.question || '');

    const [image, setImage] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [error, setError] = useState('');

    // Fetch written question if not present in location.state
    useEffect(() => {
        if (!question) {
            // Get params from location.state or fallback to defaults
            const className = location.state?.className || location.state?.class || 'Class 9';
            const subject = location.state?.subject || 'Science';
            const chapter = location.state?.chapter || 'Chapter 1';
            const params = new URLSearchParams({
                className,
                subject,
                chapter
            });
            fetch(`${API_BASE_URL}${API_ENDPOINTS.WRITTEN_QUESTION}?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    // Assume the backend returns { question: '...' } or similar
                    setQuestion(data.question || 'No question found.');
                })
                .catch(() => setQuestion('No question found.'));
        }
    }, [question, location.state]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewURL(URL.createObjectURL(file));
            setError(''); // Clear any previous errors
        }
    };

    const handleSubmit = async () => {
        if (!image) {
            setError("Please upload an image of your written answer.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append("image", image);
        formData.append("question", question);

        try {
            const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUBMIT_WRITTEN}`, {
                method: 'POST',
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
            setError('Something went wrong. Please try again.');
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gray-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-gray-700 text-lg mt-6 font-medium">Analyzing your answer...</p>
                </div>
            )}

            {/* Header */}
            <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b border-gray-100 shrink-0 bg-gradient-to-r from-white to-gray-50/50">
                <img src={flowLogo} alt="FLOW Logo" className="h-10" />
                <button 
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-[#343434] hover:text-white transition-all flex items-center gap-2"
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
                    <h1 className="text-3xl md:text-4xl font-bold text-[#343434] mb-4 flex items-center justify-center gap-3">
                        <FaPen className="text-[#343434]" />
                        Written Question Practice
                    </h1>
                    <p className="text-gray-600 text-lg">Upload a photo of your handwritten answer for evaluation</p>
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-[#343434] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#343434]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Question
                    </h2>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <p className="text-gray-800 text-lg leading-relaxed">{question}</p>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-[#343434] mb-6 flex items-center gap-2">
                        <FaUpload className="text-[#343434]" />
                        Upload Your Answer
                    </h2>
                    
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#343434] transition-colors duration-300">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FaUpload className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-gray-700">
                                        {image ? 'Image uploaded successfully!' : 'Click to upload image'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {image ? image.name : 'PNG, JPG, JPEG up to 10MB'}
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Image Preview */}
                    {previewURL && (
                        <div className="mt-6">
                            <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-[#343434]">Preview</h3>
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
                        disabled={isSubmitting || !image} 
                        className="px-8 py-4 bg-[#343434] hover:from-gray-800 hover:to-gray-900 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
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
                    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-[#343434] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#343434]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            AI Feedback
                        </h2>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                            <TextDisplay content={feedback} />
                        </div>
                        <div className="flex justify-center mt-6">
                            <button 
                                onClick={reset}
                                className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#343434] font-medium rounded-lg transition-all hover:shadow-md flex items-center space-x-2"
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
