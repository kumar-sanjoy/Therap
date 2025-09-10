import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCamera, FaQuestionCircle, FaLightbulb, FaUpload, FaCheckCircle, FaTimesCircle, FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa';
import { MdRefresh } from "react-icons/md";
import flowLogo from '../../../assets/flow-main-nobg.png';
import flowLogoDark from '../../../assets/flow-dark.png';
import TextDisplay from "../../Common/TextDisplay";
import { API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../../../config';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

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
    const [showImageModal, setShowImageModal] = useState(false);

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

                {/* Claude-Style Question Input */}
                <div className="mx-auto max-w-2xl mb-8">
                    <fieldset className="flex w-full min-w-0 flex-col">
                        {/* Hidden file input */}
                        <input 
                            id="chat-input-file-upload-onpage" 
                            data-testid="file-upload" 
                            aria-hidden="true" 
                            tabIndex="-1" 
                            className="absolute -z-10 h-0 w-0 overflow-hidden opacity-0 select-none" 
                            accept="image/*" 
                            multiple="" 
                            aria-label="Upload files" 
                            type="file"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                        />
                        
                        {/* Main input container */}
                        <div className={`!box-content flex flex-col mx-2 md:mx-0 items-stretch transition-all duration-200 relative cursor-text z-10 rounded-2xl border border-transparent ${
                            isDarkMode 
                                ? 'bg-gray-800 shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/3.5%),0_0_0_0.5px_hsla(0_0%_100%/0.15)] hover:shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/3.5%),0_0_0_0.5px_hsla(0_0%_100%/0.3)] focus-within:shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/7.5%),0_0_0_0.5px_hsla(0_0%_100%/0.3)]' 
                                : 'bg-white shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/3.5%),0_0_0_0.5px_hsla(0_0%_0%/0.15)] hover:shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/3.5%),0_0_0_0.5px_hsla(0_0%_0%/0.3)] focus-within:shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/7.5%),0_0_0_0.5px_hsla(0_0%_0%/0.3)]'
                        }`} style={{ position: 'relative' }}>
                            
                            {/* Text input area */}
                            <div className="flex flex-col gap-3.5 m-3.5">
                                <div className="relative">
                                    <div className="max-h-96 w-full overflow-y-auto font-large break-words transition-opacity duration-200 min-h-[3rem]">
                                        <textarea
                                            placeholder="How can I help you today?"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className={`w-full bg-transparent border-none outline-none resize-none placeholder-gray-500 text-base leading-relaxed ${
                                                isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                            }`}
                                            rows={3}
                                            style={{ minHeight: '3rem' }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Bottom controls */}
                                <div className="flex gap-2.5 w-full items-center">
                                    <div className="relative flex-1 flex items-center gap-2 shrink min-w-0">
                                        <div className="relative shrink-0">
                                            <div>
                                                <div className="flex items-center">
                                                    <div className="flex shrink-0" data-state="closed">
                                                        <button 
                                                            className={`inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 ${
                                                                isDarkMode 
                                                                    ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700' 
                                                                    : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100'
                                                            } active:scale-[0.98]`}
                                                            type="button" 
                                                            aria-pressed="false" 
                                                            aria-expanded="false" 
                                                            aria-haspopup="listbox" 
                                                            aria-controls="input-menu" 
                                                            data-testid="input-menu-plus" 
                                                            aria-label="Open attachments menu"
                                                            onClick={handleMediaClick}
                                                        >
                                                            <div className="flex flex-row items-center justify-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                                                                </svg>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="relative shrink-0">
                                            <div>
                                                <div className="flex items-center">
                                                    <div className="flex shrink-0" data-state="closed">
                                                        <button 
                                                            className={`inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 ${
                                                                isDarkMode 
                                                                    ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700' 
                                                                    : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100'
                                                            } active:scale-[0.98] ${isRecording ? 'bg-red-100 border-red-300' : ''}`}
                                                            type="button" 
                                                            aria-pressed={isRecording}
                                                            aria-expanded="false" 
                                                            aria-haspopup="listbox" 
                                                            aria-controls="input-menu" 
                                                            data-testid="input-menu-voice" 
                                                            aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
                                                            onClick={isRecording ? stopRecording : startRecording}
                                                            disabled={!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext}
                                                        >
                                                            <div className="flex flex-row items-center justify-center gap-1">
                                                                {isRecording ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                                        <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0v-24.4A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64.07,64.07,0,0,0,128,0,8,8,0,0,1,16,0,80.11,80.11,0,0,1-72,79.6Z"></path>
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-row items-center gap-2 min-w-0"></div>
                                    <div className="text-gray-400 text-xs ml-2"></div>
                                </div>
                                
                                {/* Send button */}
                                <div className="overflow-hidden shrink-0 p-1 -m-1">
                                    <button 
                                        className={`inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none h-7 border-0.5 text-white ml-1.5 inline-flex items-start gap-[0.175em] rounded-md border-transparent text-sm transition hover:opacity-100 disabled:!opacity-80 hover:bg-opacity-80 px-1.5 ${
                                            isDarkMode 
                                                ? 'bg-blue-600 hover:bg-blue-700' 
                                                : 'bg-[#343434] hover:bg-gray-800'
                                        } ${isSubmitting || (!question.trim() && !imageFile && !audioBlob) ? 'opacity-50' : 'opacity-100'}`}
                                        disabled={isSubmitting || (!question.trim() && !imageFile && !audioBlob)}
                                        type="button" 
                                        aria-label="Send message"
                                        onClick={handleSubmit}
                                    >
                                        <div className="flex items-center justify-center">
                                            {isSubmitting ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path>
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Refresh button - positioned at bottom right of input box */}
                            {(question.trim() || imageFile || audioBlob) && (
                                <div className="absolute bottom-2 right-2 z-20">
                                    <button 
                                        className={`inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none h-8 w-8 border-0.5 rounded-lg transition-all duration-200 ${
                                            isDarkMode 
                                                ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700 hover:border-gray-500' 
                                                : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                        }`}
                                        type="button" 
                                        aria-label="Clear all and start new question"
                                        onClick={() => {
                                            setQuestion('');
                                            setImageFile(null);
                                            setImagePreview('');
                                            setAudioBlob(null);
                                            setAudioChunks([]);
                                            setShowAnswer(false);
                                            setAnswer('');
                                            setError(null);
                                            setErrorMessage('');
                                            if (imagePreview) {
                                                URL.revokeObjectURL(imagePreview);
                                            }
                                        }}
                                        title="Clear all and start new question"
                                    >
                                        <MdRefresh />
                                    </button>
                                </div>
                            )}
                        </div>

                    </fieldset>

                    {/* Media Status Indicators */}
                    {(imageFile || audioBlob) && (
                        <div className="mt-3 flex items-center gap-3">
                            {imageFile && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <FaCamera className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700 dark:text-green-300">Image ready</span>
                                    <button
                                        onClick={handleRemoveImage}
                                        className="text-green-600 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200"
                                        title="Remove image"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {audioBlob && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <FaMicrophone className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-700 dark:text-blue-300">Audio ready</span>
                                    <button
                                        onClick={handleRemoveAudio}
                                        className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
                                        title="Remove audio"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mt-3 relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Question Preview"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                onClick={() => setShowImageModal(true)}
                                title="Click to view full image"
                            />
                        </div>
                    )}

                    {/* Image Modal */}
                    {showImageModal && imagePreview && (
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowImageModal(false)}
                        >
                            <div className="relative max-w-4xl max-h-full">
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10"
                                    aria-label="Close image"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <img
                                    src={imagePreview}
                                    alt="Question Preview Full Size"
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}
                </div>



                {/* Small Loading State */}
                {isSubmitting && (
                    <div className="mx-auto max-w-2xl mb-8">
                        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 ${
                            isDarkMode ? 'bg-gray-800/80 border-gray-600' : 'bg-white/80 border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <span className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Thinking...
                                </span>
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Analyzing your question and generating a response...
                            </div>
                        </div>
                    </div>
                )}

                {/* Answer Section */}
                {showAnswer && (
                    <div className={`mx-auto max-w-2xl mb-8 ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-xl border p-6 overflow-hidden ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${
                                isDarkMode ? 'text-gray-200' : 'text-[#343434]'
                            }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Answer
                            </h2>
                            <button
                                onClick={() => {
                                    const element = document.createElement('a');
                                    const content = `Question: ${question}\n\nAnswer: ${answer}`;
                                    const file = new Blob([content], {type: 'text/plain'});
                                    element.href = URL.createObjectURL(file);
                                    element.download = `answer_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
                                    document.body.appendChild(element);
                                    element.click();
                                    document.body.removeChild(element);
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                }`}
                                title="Download answer as text file"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                            </button>
                        </div>
                        <div className={`rounded-xl p-6 border overflow-hidden ${
                            isDarkMode 
                                ? 'bg-gray-700/50 border-gray-600' 
                                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        }`}>
                            <div className="max-w-full overflow-hidden">
                                <TextDisplay content={answer} forceBlackText={!isDarkMode} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskQuestion;