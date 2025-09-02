import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaQuestionCircle, FaLightbulb, FaUpload, FaCheckCircle, FaTimesCircle, FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa';
import { MdRefresh } from "react-icons/md";
import { useDarkTheme } from '../../Common/DarkThemeProvider.jsx';

const QuestionInput = ({ 
    question, 
    setQuestion, 
    onSubmit, 
    isSubmitting, 
    imageFile, 
    setImageFile, 
    imagePreview, 
    setImagePreview, 
    errorMessage, 
    setErrorMessage,
    audioBlob,
    setAudioBlob,
    onImagePreviewClick
}) => {
    const { isDarkMode } = useDarkTheme();
    const fileInputRef = useRef(null);
    
    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if audio is already uploaded
        if (audioBlob) {
            setErrorMessage('You can only upload either an image OR audio, not both. Please remove the audio recording first.');
            fileInputRef.current.value = '';
            return;
        }

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
            // Check if image is already uploaded
            if (imageFile) {
                setErrorMessage('You can only upload either an image OR audio, not both. Please remove the image first.');
                return;
            }

            if (!navigator.mediaDevices) {
                setErrorMessage('Voice recording is not supported in this browser.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(blob);
                setAudioChunks(chunks);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            setErrorMessage('Failed to start voice recording. Please check your microphone permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = () => {
        if (!question.trim() && !imageFile && !audioBlob) {
            setErrorMessage('Please enter a question, upload an image, or record audio.');
            return;
        }
        onSubmit();
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Error Message */}
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-red-500" />
                        <span className="text-red-700">{errorMessage}</span>
                    </div>
                </div>
            )}

            {/* Info Message about upload limitation */}
            <div className={`mb-6 p-4 border rounded-lg ${
                isDarkMode 
                    ? 'bg-blue-900/20 border-blue-700' 
                    : 'bg-blue-50 border-blue-200'
            }`}>
                <div className="flex items-center gap-2">
                    <FaLightbulb className="text-blue-500" />
                    <span className={`text-sm ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                        <strong>Note:</strong> You can only upload either an image OR audio, not both at the same time.
                    </span>
                </div>
            </div>

            {/* Question Input Container */}
            <div className="relative">
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
                            {/* Media type indicator */}
                            {(imageFile || audioBlob) && (
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                    imageFile 
                                        ? (isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-600' : 'bg-green-100 text-green-700 border border-green-300')
                                        : (isDarkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-600' : 'bg-blue-100 text-blue-700 border border-blue-300')
                                }`}>
                                    {imageFile ? '📷 Image Mode' : '🎤 Audio Mode'}
                                </div>
                            )}
                            
                            <div className="relative flex-1 flex items-center gap-2 shrink min-w-0">
                                {/* Image upload button */}
                                <div className="relative shrink-0">
                                    <button 
                                        className={`inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 ${
                                            audioBlob 
                                                ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-400'
                                                : isDarkMode 
                                                    ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700' 
                                                    : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100'
                                        } active:scale-[0.98]`}
                                        type="button" 
                                        aria-label={audioBlob ? "Cannot upload image while audio is present" : "Upload image"}
                                        onClick={audioBlob ? null : handleMediaClick}
                                        disabled={!!audioBlob}
                                    >
                                        <FaCamera className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Voice recording button */}
                                <div className="relative shrink-0">
                                    <button 
                                        className={`inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 ${
                                            imageFile 
                                                ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-400'
                                                : isDarkMode 
                                                    ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700' 
                                                    : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100'
                                        } active:scale-[0.98] ${isRecording ? 'bg-red-100 border-red-300' : ''}`}
                                        type="button" 
                                        aria-label={isRecording ? "Stop voice recording" : imageFile ? "Cannot record audio while image is present" : "Start voice recording"}
                                        onClick={isRecording ? stopRecording : (imageFile ? null : startRecording)}
                                        disabled={!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext || !!imageFile}
                                    >
                                        {isRecording ? (
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <FaStop className="w-4 h-4 text-red-500" />
                                            </div>
                                        ) : (
                                            <FaMicrophone className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Recording timer */}
                                {isRecording && (
                                    <span className="text-sm text-red-500 font-mono">
                                        {formatTime(recordingTime)}
                                    </span>
                                )}
                            </div>

                            {/* Submit button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || (!question.trim() && !imageFile && !audioBlob)}
                                className={`inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 ${
                                    isSubmitting || (!question.trim() && !imageFile && !audioBlob)
                                        ? 'opacity-50 cursor-not-allowed'
                                        : isDarkMode
                                            ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700'
                                            : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100'
                                } active:scale-[0.98]`}
                                type="button"
                                aria-label="Submit question"
                            >
                                {isSubmitting ? (
                                    <MdRefresh className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FaQuestionCircle className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="mt-4 mx-2 md:mx-0">
                    <div className={`relative inline-block rounded-lg border-2 border-dashed ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                        <img
                            src={imagePreview}
                            alt="Question Preview"
                            className="max-w-xs max-h-48 object-contain rounded-lg cursor-pointer"
                            onClick={onImagePreviewClick}
                        />
                        <button
                            onClick={handleRemoveImage}
                            className={`absolute -top-2 -right-2 p-1 rounded-full ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            } shadow-lg`}
                            aria-label="Remove image"
                        >
                            <FaTimesCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Audio Preview */}
            {audioBlob && (
                <div className="mt-4 mx-2 md:mx-0">
                    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                    }`}>
                        <FaMicrophone className="w-5 h-5 text-blue-500" />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Audio recording ({Math.round(audioBlob.size / 1024)}KB)
                        </span>
                        <button
                            onClick={handleRemoveAudio}
                            className={`ml-auto p-1 rounded-full ${
                                isDarkMode 
                                    ? 'text-gray-400 hover:text-gray-300' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            aria-label="Remove audio"
                        >
                            <FaTimesCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionInput;
