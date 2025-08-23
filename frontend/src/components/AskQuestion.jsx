import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCamera, FaQuestionCircle, FaLightbulb, FaUpload, FaCheckCircle, FaTimesCircle, FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa';
import flowLogo from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import TextDisplay from "./TextDisplay";
import { API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config';
import { useDarkTheme } from './DarkThemeProvider';

const AskQuestion = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useDarkTheme();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('');

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audioBlob, setAudioBlob] = useState(null); // Store audio blob for sending to backend
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef(null);

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const role = localStorage.getItem(STORAGE_KEYS.ROLE);
        
        if (!token || !username) {
            navigate('/login');
            return;
        }
        
        // Check if user has the correct role for this page (AskQuestion is student-only)
        if (role !== 'STUDENT') {
            if (role === 'TEACHER') {
                navigate('/teacher');
            } else {
                navigate('/login');
            }
            return;
        }
    }, [navigate]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isUnderSizeLimit = file.size <= 10 * 1024 * 1024;
        if (!isImage) {
            setErrorMessage('Only image files are allowed.');
            return;
        }
        if (!isUnderSizeLimit) {
            setErrorMessage('File must be under 10MB.');
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrorMessage('');
        fileInputRef.current.value = '';
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    };

    const handleRemoveAudio = () => {
        setAudioBlob(null);
        setAudioChunks([]);
    };

    const handleMediaClick = () => {
        fileInputRef.current.click();
    };

    // Voice recording functions
    const startRecording = async () => {
        try {
            // Check if mediaDevices is supported
            if (!navigator.mediaDevices) {
                throw new Error('MediaDevices API is not supported in this browser');
            }
            
            if (!navigator.mediaDevices.getUserMedia) {
                
                // Check for legacy getUserMedia support
                if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) {
                    throw new Error('Legacy MediaDevices API detected but not supported in this implementation');
                }
                
                throw new Error('MediaDevices API is not supported in this browser');
            }
            
            // Check if we're in a secure context (HTTPS or localhost)
            if (!window.isSecureContext) {
                throw new Error('MediaDevices API requires a secure context (HTTPS or localhost)');
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Safari-specific MIME type handling
            const userAgent = navigator.userAgent.toLowerCase();
            const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('chromium');
            
            let selectedMimeType = null;
            
            if (isSafari) {
                // Safari prefers these formats
                const safariMimeTypes = [
                    'audio/mp4',
                    'audio/aac',
                    'audio/wav'
                ];
                
                for (const mimeType of safariMimeTypes) {
                    if (MediaRecorder.isTypeSupported(mimeType)) {
                        selectedMimeType = mimeType;
                        break;
                    }
                }
            } else {
                // Other browsers
                const mimeTypes = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/mp4',
                    'audio/ogg;codecs=opus',
                    'audio/wav'
                ];

                for (const mimeType of mimeTypes) {
                    if (MediaRecorder.isTypeSupported(mimeType)) {
                        selectedMimeType = mimeType;
                        break;
                    }
                }
            }

            if (!selectedMimeType) {
                console.warn('No supported audio format found, using default');
                selectedMimeType = 'audio/webm'; // Fallback
            }

            const recorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType
            });

            const chunks = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: selectedMimeType });
                setAudioChunks(chunks);
                setAudioBlob(audioBlob); // Store the audio blob for sending to backend
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(1000); // Collect data every second
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            const userAgent = navigator.userAgent.toLowerCase();
            const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('chromium');
            
            if (error.message.includes('MediaDevices API is not supported')) {
                setError('Audio recording is not supported in this browser. Please try typing your question.');
            } else if (error.message.includes('secure context')) {
                setError('Audio recording requires HTTPS or localhost. Please use a secure connection.');
            } else if (error.name === 'NotSupportedError') {
                if (isSafari) {
                    setError('Safari audio recording requires HTTPS. Please use a secure connection or try typing your question.');
                } else {
                    setError('Audio recording is not supported in this browser. Please try typing your question.');
                }
            } else if (error.name === 'NotAllowedError') {
                if (isSafari) {
                    setError('Safari requires microphone permission. Please allow access in Safari settings and try again.');
                } else {
                    setError('Microphone access denied. Please allow microphone permissions and try again.');
                }
            } else if (error.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone and try again.');
            } else if (error.name === 'NotReadableError') {
                if (isSafari) {
                    setError('Safari microphone is in use. Please close other apps using the microphone and try again.');
                } else {
                    setError('Microphone is already in use by another application. Please close other apps using the microphone.');
                }
            } else {
                if (isSafari) {
                    setError('Safari audio recording failed. Please check microphone permissions and try again.');
                } else {
                    setError('Could not access microphone. Please check permissions and try again.');
                }
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);

            // Clear timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup effect for recording timer
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!question.trim() && !imageFile && !audioBlob) {
            setError('Please enter your question, upload an image, or record audio');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
            if (!userId) {
                navigate('/login');
                return;
            }

            // Use FormData to handle both text and image
            const formData = new FormData();

            if (question.trim()) {
                formData.append('question', question.trim());
            }

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (audioBlob) {
                formData.append('audio', audioBlob);
            }

            const apiUrl = `${LEARNING_API_BASE_URL}${API_ENDPOINTS.CLEAR_DOUBT}`;
            
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type header - let browser set it with boundary for FormData
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                
                // Clear doubt API returns 'answer' field
                const answerText = data.answer || data.response || 'No answer received';
                
                setAnswer(answerText);
                setShowAnswer(true);
            } else {
                const data = await response.json().catch(() => ({ message: 'Unknown error' }));
                setError(data.message || `Failed to get answer (Status: ${response.status})`);
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            setError(`Network error: ${error.message}. Please check your connection and try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200'}`}>
            {/* Enhanced Loading Overlay */}
            {isSubmitting && (
                <div className={`fixed inset-0 backdrop-blur-lg flex flex-col items-center justify-center z-50 ${
                    isDarkMode 
                        ? 'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95' 
                        : 'bg-gradient-to-br from-blue-50/95 via-white/95 to-purple-50/95'
                }`}>
                    <div className="relative flex flex-col items-center">
                        {/* Main Loading Container */}
                        <div className="relative mb-8">
                            {/* Outer Ring */}
                            <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin"></div>
                            {/* Middle Ring */}
                            <div className="absolute inset-2 w-20 h-20 border-4 border-purple-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                            {/* Inner Ring */}
                            <div className="absolute inset-4 w-16 h-16 border-4 border-indigo-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                            {/* Center Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Loading Text */}
                        <div className="text-center mb-6">
                            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Analyzing Your Question</h3>
                            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Our AI is carefully processing your query...</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Question Received</span>
                            </div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI Processing</span>
                            </div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Generating Answer</span>
                            </div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>

                        {/* Fun Facts */}
                        <div className="text-center">
                            <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Did you know? Our AI can understand questions in multiple languages!</p>
                        </div>

                        {/* Floating Particles */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(15)].map((_, i) => (
                                <div 
                                    key={i}
                                    className="absolute rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"
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
            <header className={`w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${isDarkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-100 bg-gradient-to-r from-white to-gray-50/50'}`}>
                <img src={isDarkMode ? flowLogoDark : flowLogo} alt="FLOW Logo" className="h-10" />
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
                    <h1 className={`text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isDarkMode ? 'text-white' : 'text-[#343434]'}`}>
                        <FaQuestionCircle className={isDarkMode ? 'text-white' : 'text-[#343434]'} />
                        Clear Your Doubts
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ask any question and get instant AI-powered answers</p>
                </div>

                {/* Error Messages */}
                {error && (
                    <div className={`mb-6 p-4 border rounded-xl shadow-sm ${
                        isDarkMode 
                            ? 'bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-700' 
                            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                    }`}>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className={`mb-6 p-4 border rounded-xl shadow-sm ${
                        isDarkMode 
                            ? 'bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-700' 
                            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                    }`}>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Question Input Section */}
                <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-8 ${
                    isDarkMode 
                        ? 'bg-gray-800/80 border-gray-700' 
                        : 'bg-white/80 border-gray-200'
                }`}>
                    <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#343434]'}`}>
                        <FaLightbulb className={isDarkMode ? 'text-white' : 'text-[#343434]'} />
                        Ask Your Question
                    </h2>

                    <div className="space-y-6">
                        {/* Text Input */}
                        <div className="relative">
                            <textarea
                                placeholder="Type your question here... (You can also upload an image or record your voice below)"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className={`w-full px-6 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#343434]/50 focus:border-transparent transition-all duration-300 resize-none min-h-[120px] max-h-[300px] backdrop-blur-sm shadow-sm ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400' 
                                        : 'border-gray-200 bg-white/50 text-gray-800 placeholder-gray-500'
                                }`}
                                rows={4}
                            />
                            <div className={`absolute bottom-3 right-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {question.length}/1000
                            </div>
                        </div>

                        {/* Voice Input Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-[#343434] flex items-center gap-2">
                                    <FaMicrophone className="text-blue-600" />
                                    Voice Input
                                </h3>
                                
                                {/* Browser Compatibility Info */}
                                {(() => {
                                    // More comprehensive Safari detection
                                    const userAgent = navigator.userAgent.toLowerCase();
                                    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('chromium');
                                    const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
                                    const isSecureContext = window.isSecureContext;
                                    
                                    // Debug logging
                                    console.log('🔍 [AUDIO DEBUG] Browser check:', {
                                        userAgent: navigator.userAgent,
                                        isSafari,
                                        hasMediaDevices: !!hasMediaDevices,
                                        isSecureContext,
                                        mediaDevices: !!navigator.mediaDevices,
                                        getUserMedia: !!navigator.mediaDevices?.getUserMedia
                                    });
                                    
                                    if (!hasMediaDevices) {
                                        console.log('🔍 [AUDIO DEBUG] No MediaDevices support detected');
                                        return (
                                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                                ⚠️ Audio recording not supported
                                            </div>
                                        );
                                    }
                                    
                                    if (!isSecureContext) {
                                        console.log('🔍 [AUDIO DEBUG] Not in secure context');
                                        return (
                                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                                ⚠️ HTTPS required for audio
                                            </div>
                                        );
                                    }
                                    
                                    if (isSafari) {
                                        console.log('🔍 [AUDIO DEBUG] Safari detected, showing Safari indicator');
                                        return (
                                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                                🎤 Safari audio recording
                                            </div>
                                        );
                                    }
                                    
                                    console.log('🔍 [AUDIO DEBUG] All checks passed, no indicator needed');
                                    return null;
                                })()}
                                
                                {isRecording && (
                                    <div className="flex items-center text-red-600">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        disabled={!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaMicrophone className="w-4 h-4" />
                                        <span>Start Recording</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                                    >
                                        <FaStop className="w-4 h-4" />
                                        <span>Stop Recording</span>
                                    </button>
                                )}
                            </div>

                            {/* Audio Recording Status */}
                            {audioBlob && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaMicrophone className="text-green-600" />
                                            <span className="text-sm font-medium text-green-800">Audio recorded successfully!</span>
                                        </div>
                                        <button
                                            onClick={handleRemoveAudio}
                                            className="text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-300 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">
                                        Audio will be sent to the backend for processing
                                    </p>
                                </div>
                            )}


                        </div>

                        {/* Image Upload Section */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#343434] transition-colors duration-300 group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                ref={fileInputRef}
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 group-focus-within:bg-gray-200 transition-colors duration-300">
                                        <FaCamera className="w-8 h-8 text-gray-400 group-hover:text-[#343434] group-focus-within:text-[#343434] transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-700">
                                            {imageFile ? 'Image uploaded successfully!' : 'Click to upload image'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {imageFile ? imageFile.name : 'PNG, JPG, JPEG up to 10MB'}
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-[#343434]">Image Preview</h3>
                                    <button
                                        onClick={handleRemoveImage}
                                        className="text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-300 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Question Preview"
                                        className="w-full max-h-64 object-contain rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!question.trim() && !imageFile && !audioBlob)}
                        className="px-8 py-4 bg-gradient-to-r from-[#343434] to-gray-700 hover:from-gray-800 hover:to-gray-900 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <FaQuestionCircle className="w-5 h-5" />
                                <span>Ask Question</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Answer Section */}
                {showAnswer && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 overflow-hidden">
                        <h2 className="text-xl font-bold text-[#343434] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#343434]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Answer
                        </h2>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 overflow-hidden">
                            <div className="max-w-full overflow-hidden">
                                <TextDisplay content={answer} forceBlackText={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskQuestion;