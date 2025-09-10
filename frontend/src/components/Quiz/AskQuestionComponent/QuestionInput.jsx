import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaQuestionCircle, FaLightbulb, FaUpload, FaCheckCircle, FaTimesCircle, FaMicrophone, FaMicrophoneSlash, FaStop, FaPlay, FaPause, FaVolumeUp, FaVolumeOff, FaFile, FaFileAlt } from 'react-icons/fa';
import { MdRefresh } from "react-icons/md";
import { TiArrowUpThick } from "react-icons/ti";
import { useDarkTheme } from '../../Common/DarkThemeProvider';

// Simple Tooltip Component
const Tooltip = ({ children, text, position = "top" }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    const positionClasses = {
        top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
        left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
    };
    
    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap ${positionClasses[position]}`}>
                    {text}
                    <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                        position === "top" ? "top-full left-1/2 -translate-x-1/2 -mt-1" :
                        position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 -mb-1" :
                        position === "left" ? "left-full top-1/2 -translate-y-1/2 -ml-1" :
                        "right-full top-1/2 -translate-y-1/2 -mr-1"
                    }`}></div>
                </div>
            )}
        </div>
    );
};

const QuestionInput = ({ 
    question = '', 
    setQuestion = () => {}, 
    onSubmit = () => {}, 
    isSubmitting = false, 
    imageFile = null, 
    setImageFile = () => {}, 
    imagePreview = '', 
    setImagePreview = () => {}, 
    errorMessage = '', 
    setErrorMessage = () => {},
    audioBlob = null,
    setAudioBlob = () => {},
    onImagePreviewClick = () => {},
    onTranscriptionComplete = () => {}
}) => {
    const { isDarkMode } = useDarkTheme();
    const fileInputRef = useRef(null);
    
    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef(null);
    const audioStreamRef = useRef(null);
    
    // Audio playback states
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    // Audio transcription states
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionText, setTranscriptionText] = useState('');
    const [transcriptionError, setTranscriptionError] = useState(null);
    const [showTranscription, setShowTranscription] = useState(false);
    const [isTranscriptionComplete, setIsTranscriptionComplete] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Enhanced audio blob handling
    useEffect(() => {
        if (audioBlob) {
            // Clean up previous audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            
            setIsPlaying(false);
            setCurrentTime(0);
            setAudioDuration(0);
            setIsAudioLoading(false);
            setAudioError(null);
            
            // Create new audio URL
            const newUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(newUrl);
            
            // Note: Don't call .load() here - wait for audioUrl to update
        } else {
            // Clean up when no audio blob
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
            }
            
            setIsPlaying(false);
            setCurrentTime(0);
            setAudioDuration(0);
            setIsAudioLoading(false);
            setAudioError(null);
            
            // Reset transcription states when audio is removed
            setTranscriptionText('');
            setTranscriptionError(null);
            setShowTranscription(false);
            setIsTranscribing(false);
            setIsTranscriptionComplete(false);
        }
    }, [audioBlob]);

    // Load audio element when audioUrl changes
    useEffect(() => {
        if (audioUrl && audioRef.current) {
            console.log('Loading audio element with URL:', audioUrl);
            audioRef.current.load();
        }
    }, [audioUrl]);

    // Enhanced image upload handler
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (audioBlob) {
            setErrorMessage('You can only upload either an image OR audio, not both. Please remove the audio recording first.');
            fileInputRef.current.value = '';
            return;
        }

        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type.toLowerCase())) {
            setErrorMessage('Only JPEG, PNG, GIF, and WebP image files are allowed.');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setErrorMessage(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit.`);
            return;
        }

        setImageFile(file);
        
        // Revoke previous image URL to prevent memory leaks
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        
        setImagePreview(URL.createObjectURL(file));
        setErrorMessage('');
        fileInputRef.current.value = '';
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview('');
    };

    const handleRemoveAudio = () => {
        setAudioBlob(null);
        // Reset transcription states
        setTranscriptionText('');
        setTranscriptionError(null);
        setShowTranscription(false);
        setIsTranscribing(false);
        setIsTranscriptionComplete(false);
        // The cleanup will be handled by the useEffect when audioBlob becomes null
    };

    const handleMediaClick = () => {
        fileInputRef.current?.click();
    };

    // Enhanced voice recording
    const startRecording = async () => {
        try {
            console.log('🎤 Starting audio recording...');
            
            if (imageFile) {
                setErrorMessage('You can only upload either an image OR audio, not both. Please remove the image first.');
                return;
            }

            // Check if MediaRecorder is supported
            if (!window.MediaRecorder) {
                setErrorMessage('MediaRecorder is not supported in this browser. Please use a modern browser.');
                return;
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                setErrorMessage('Voice recording is not supported in this browser or requires HTTPS.');
                return;
            }

            console.log('✅ Browser supports audio recording');

            console.log('🎵 Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            console.log('✅ Microphone access granted:', stream);
            audioStreamRef.current = stream;

            // Check for supported MIME types with better fallback
            let mimeType = null;
            
            // Try different MIME types in order of preference
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus',
                'audio/ogg',
                'audio/wav'
            ];
            
            // Debug: Log all supported MIME types
            console.log('🔍 Checking MIME type support:');
            mimeTypes.forEach(type => {
                const supported = MediaRecorder.isTypeSupported(type);
                console.log(`  ${type}: ${supported ? '✅' : '❌'}`);
            });
            
            for (const type of mimeTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    mimeType = type;
                    break;
                }
            }
            
            // If no MIME type is supported, don't specify one (let browser choose)
            if (!mimeType) {
                console.warn('⚠️ No specific MIME type supported, using browser default');
                mimeType = undefined;
            } else {
                console.log('✅ Using MIME type for recording:', mimeType);
            }

            console.log('🎙️ Creating MediaRecorder with MIME type:', mimeType);
            const recorder = new MediaRecorder(stream, { 
                ...(mimeType && { mimeType }),
                audioBitsPerSecond: 128000
            });
            const chunks = [];
            
            console.log('✅ MediaRecorder created successfully');

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                // Use the actual MIME type from the recorder if available, otherwise use detected type
                const actualMimeType = recorder.mimeType || mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: actualMimeType });
                
                console.log('Audio recording completed:', {
                    size: blob.size,
                    type: blob.type,
                    duration: recordingTime,
                    requestedMimeType: mimeType,
                    actualMimeType: actualMimeType,
                    recorderMimeType: recorder.mimeType
                });
                setAudioBlob(blob);
                
                // Stop all tracks
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => track.stop());
                    audioStreamRef.current = null;
                }
            };

            recorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                setErrorMessage('Recording failed. Please try again.');
                setIsRecording(false);
                if (recordingTimerRef.current) {
                    clearInterval(recordingTimerRef.current);
                }
            };

            console.log('▶️ Starting recording...');
            recorder.start(100); // Collect data every 100ms
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            
            console.log('✅ Recording started successfully');

            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            setErrorMessage(`Failed to start voice recording: ${error.message}`);
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
        }
    };

    const stopRecording = () => {
        console.log('⏹️ Stopping recording...');
        if (mediaRecorder && isRecording) {
            console.log('✅ Stopping MediaRecorder...');
            mediaRecorder.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
            console.log('✅ Recording stopped successfully');
        } else {
            console.log('❌ Cannot stop recording - no active recorder or not recording');
        }
    };

    // Enhanced audio playback
    const handlePlayAudio = async () => {
        if (!audioRef.current || !audioUrl) {
            setErrorMessage('Audio not available for playback.');
            return;
        }

        try {
            setIsAudioLoading(true);
            setAudioError(null);
            
            console.log('🎵 Attempting to play audio:', {
                src: audioRef.current.src,
                readyState: audioRef.current.readyState,
                paused: audioRef.current.paused,
                currentTime: audioRef.current.currentTime,
                duration: audioRef.current.duration
            });
            
            // Ensure audio is properly configured
            audioRef.current.volume = isMuted ? 0 : volume;
            audioRef.current.currentTime = currentTime;
            
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                setIsPlaying(true);
                console.log('✅ Audio playback started successfully');
            }
        } catch (error) {
            console.error('❌ Error playing audio:', error);
            setAudioError(`Playback failed: ${error.message}`);
            setErrorMessage(`Audio playback failed: ${error.message}`);
        } finally {
            setIsAudioLoading(false);
        }
    };

    const handlePauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : newVolume;
        }
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.volume = !isMuted ? 0 : volume;
        }
    };

    // Audio event handlers
    const handleAudioTimeUpdate = () => {
        if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleAudioLoadedMetadata = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            setAudioDuration(audioRef.current.duration);
            setAudioError(null);
            console.log('📊 Audio metadata loaded:', {
                duration: audioRef.current.duration,
                readyState: audioRef.current.readyState,
                src: audioRef.current.src
            });
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handleAudioError = () => {
        const error = audioRef.current?.error;
        console.error('Audio element error:', error);
        
        let errorMessage = 'Unknown audio error';
        if (error) {
            switch (error.code) {
                case error.MEDIA_ERR_ABORTED:
                    errorMessage = 'Audio loading was aborted';
                    break;
                case error.MEDIA_ERR_NETWORK:
                    errorMessage = 'Network error while loading audio';
                    break;
                case error.MEDIA_ERR_DECODE:
                    errorMessage = 'Audio format not supported or corrupted';
                    break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage = 'Audio format not supported';
                    break;
            }
        }
        
        setAudioError(errorMessage);
        setIsPlaying(false);
        setIsAudioLoading(false);
    };

    const handleSeek = (e) => {
        if (audioRef.current && audioDuration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const seekTime = Math.max(0, Math.min((clickX / width) * audioDuration, audioDuration));
            
            audioRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Audio transcription functions
    const transcribeAudio = async () => {
        if (!audioBlob) {
            setTranscriptionError('No audio available for transcription');
            return;
        }

        setIsTranscribing(true);
        setTranscriptionError(null);
        setTranscriptionText('');

        try {
            // Method 1: Try Web Speech API first (built into browser)
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                await transcribeWithWebSpeechAPI();
            } else {
                // Method 2: Fallback to manual transcription input
                setShowTranscription(true);
                setIsTranscribing(false);
                setTranscriptionError('Speech recognition not available in this browser. Please type the transcription manually.');
                
                // Show a small info message
                const infoMessage = document.createElement('div');
                infoMessage.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                infoMessage.textContent = '⚠️ Manual transcription mode';
                document.body.appendChild(infoMessage);
                
                setTimeout(() => {
                    if (document.body.contains(infoMessage)) {
                        document.body.removeChild(infoMessage);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Transcription error:', error);
            setTranscriptionError('Transcription failed. Please try typing manually.');
            setIsTranscribing(false);
            
            // Show a small error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            errorMessage.textContent = `❌ Transcription error: ${error.message}`;
            document.body.appendChild(errorMessage);
            
            setTimeout(() => {
                if (document.body.contains(errorMessage)) {
                    document.body.removeChild(errorMessage);
                }
            }, 4000);
        }
    };

    const transcribeWithWebSpeechAPI = () => {
        return new Promise((resolve, reject) => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                console.log('Speech recognition started');
                // Show a small info message
                const infoMessage = document.createElement('div');
                infoMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                infoMessage.textContent = '🎤 Listening... Please speak clearly';
                document.body.appendChild(infoMessage);
                
                setTimeout(() => {
                    if (document.body.contains(infoMessage)) {
                        document.body.removeChild(infoMessage);
                    }
                }, 3000);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setTranscriptionText(transcript);
                setShowTranscription(true);
                setIsTranscribing(false);
                setIsTranscriptionComplete(true);
                
                // Notify parent component that transcription is complete
                onTranscriptionComplete(transcript);
                
                // Show a small success message
                const successMessage = document.createElement('div');
                successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                successMessage.textContent = '✅ Transcription completed!';
                document.body.appendChild(successMessage);
                
                setTimeout(() => {
                    if (document.body.contains(successMessage)) {
                        document.body.removeChild(successMessage);
                    }
                }, 3000);
                
                resolve();
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setTranscriptionError(`Speech recognition error: ${event.error}`);
                setIsTranscribing(false);
                
                // Show a small error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                errorMessage.textContent = `❌ Transcription failed: ${event.error}`;
                document.body.appendChild(errorMessage);
                
                setTimeout(() => {
                    if (document.body.contains(errorMessage)) {
                        document.body.removeChild(errorMessage);
                    }
                }, 4000);
                
                reject(new Error(event.error));
            };

            recognition.onend = () => {
                console.log('Speech recognition ended');
                if (!transcriptionText) {
                    setIsTranscribing(false);
                    reject(new Error('No transcription result'));
                }
            };

            // Start recognition
            recognition.start();
        });
    };

    const handleTranscriptionSubmit = () => {
        if (transcriptionText.trim()) {
            setQuestion(transcriptionText.trim());
            setShowTranscription(false);
            setTranscriptionText('');
            setTranscriptionError(null);
            setIsTranscriptionComplete(false);
            
            // Show a small success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            successMessage.textContent = 'Question set from transcription!';
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                document.body.removeChild(successMessage);
            }, 3000);
        }
    };

    const handleTranscriptionCancel = () => {
        setShowTranscription(false);
        setTranscriptionText('');
        setTranscriptionError(null);
        setIsTranscriptionComplete(false);
        
        // Show a small info message
        const infoMessage = document.createElement('div');
        infoMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        infoMessage.textContent = 'Transcription cancelled';
        document.body.appendChild(infoMessage);
        
        setTimeout(() => {
            if (document.body.contains(infoMessage)) {
                document.body.removeChild(infoMessage);
            }
        }, 2000);
    };

    const handleSubmit = () => {
        if (!question.trim() && !imageFile && !audioBlob) {
            setErrorMessage('Please enter a question, upload an image, or record audio.');
            return;
        }
        
        setErrorMessage('');
        onSubmit();
    };

    // Auto-resize textarea
    const handleTextareaChange = (e) => {
        setQuestion(e.target.value);
        
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
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

            {/* Info Message */}
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
                        <strong>Note:</strong> You can only upload either an image OR audio, not both at the same time. Audio recordings will be transcribed to text before submission.
                    </span>
                </div>
            </div>

            {/* Clear Your Doubts Text */}
            <div className="mb-4 text-center">
                <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                    Clear Your Doubts
                </h2>
                <p className={`text-sm mt-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                    Ask any question and get instant answers from our AI tutor
                </p>
            </div>

            {/* Question Input Container */}
            <div className="relative">
                <input 
                    id="chat-input-file-upload-onpage" 
                    className="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" 
                    accept="image/*" 
                    type="file"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                />
                
                <div className={`flex flex-col mx-2 md:mx-0 items-stretch transition-all duration-200 relative rounded-2xl border border-transparent ${
                    isDarkMode 
                        ? 'bg-gray-800 shadow-lg hover:shadow-xl focus-within:shadow-xl' 
                        : 'bg-white shadow-lg hover:shadow-xl focus-within:shadow-xl'
                }`}>
                    
                    <div className="flex flex-col gap-3.5 m-3.5">
                        <div className="relative">
                            <div className="max-h-48 w-full overflow-y-auto">
                                <textarea
                                    placeholder={audioBlob && !question.trim() ? "Record audio and click transcribe, or type your question here..." : "How can I help you today?"}
                                    value={question}
                                    onChange={handleTextareaChange}
                                    className={`w-full bg-transparent border-none outline-none resize-none placeholder-gray-500 text-base leading-relaxed ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}
                                    rows={1}
                                    style={{ minHeight: '3rem', maxHeight: '200px' }}
                                />
                            </div>
                            
                            {/* Audio transcription hint */}
                            {audioBlob && !question.trim() && (
                                <div className="absolute -bottom-6 left-0 text-xs text-blue-600 dark:text-blue-400">
                                    💡 Audio recorded! Click the green transcribe button below to convert to text
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-2.5 w-full items-center">
                            {(imageFile || audioBlob) && (
                                <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                    imageFile 
                                        ? (isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-600' : 'bg-green-100 text-green-700 border border-green-300')
                                        : (isDarkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-600' : 'bg-blue-100 text-blue-700 border border-blue-300')
                                }`}>
                                    {imageFile ? (
                                        <>
                                            <FaCamera className="w-3 h-3" />
                                            Image Mode
                                        </>
                                    ) : (
                                        <>
                                            <FaMicrophone className="w-3 h-3" />
                                            Audio Mode
                                        </>
                                    )}
                                </div>
                            )}
                            
                            {/* Transcribed Question Badge */}
                            {question.trim() && isTranscriptionComplete && (
                                <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                    isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-600' : 'bg-green-100 text-green-700 border border-green-300'
                                }`}>
                                    <FaFileAlt className="w-3 h-3" />
                                    Transcribed
                                </div>
                            )}
                            
                            <div className="relative flex-1 flex items-center gap-2 shrink min-w-0">
                                <div className="relative shrink-0">
                                    <Tooltip text={audioBlob ? "Cannot upload image while audio is present" : "Add Image"}>
                                        <button 
                                            className={`inline-flex items-center justify-center relative shrink-0 transition-all h-8 min-w-8 rounded-lg px-[7.5px] border ${
                                                audioBlob 
                                                    ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-400'
                                                    : isDarkMode 
                                                        ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700' 
                                                        : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100'
                                            } active:scale-95`}
                                            type="button" 
                                            onClick={audioBlob ? null : handleMediaClick}
                                            disabled={!!audioBlob}
                                        >
                                            <FaCamera className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                </div>
                                
                                <div className="relative shrink-0">
                                    <Tooltip text={isRecording ? "Stop Recording" : imageFile ? "Cannot record audio while image is present" : "Record Audio"}>
                                        <button 
                                            className={`inline-flex items-center justify-center relative shrink-0 transition-all h-8 min-w-8 rounded-lg px-[7.5px] border ${
                                                imageFile 
                                                    ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-400'
                                                    : isRecording
                                                        ? 'bg-red-100 border-red-300 text-red-600 hover:bg-red-200'
                                                        : isDarkMode 
                                                            ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700' 
                                                            : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:bg-gray-100'
                                            } active:scale-95`}
                                            type="button" 
                                            onClick={isRecording ? stopRecording : (imageFile ? null : startRecording)}
                                            disabled={!navigator.mediaDevices || !!imageFile}
                                        >
                                            {isRecording ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                    <FaStop className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <FaMicrophone className="w-4 h-4" />
                                            )}
                                        </button>
                                    </Tooltip>
                                </div>

                                {isRecording && (
                                    <span className="text-sm text-red-500 font-mono">
                                        {formatTime(recordingTime)}
                                    </span>
                                )}
                            </div>

                            <Tooltip text={isSubmitting ? "Submitting..." : (!question.trim() && !imageFile && !audioBlob) ? "Please enter a question, image, or audio" : "Ask Question"}>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || (!question.trim() && !imageFile && !audioBlob)}
                                    className={`inline-flex items-center justify-center relative shrink-0 transition-all h-8 min-w-8 rounded-lg px-[7.5px] border ${
                                        isSubmitting || (!question.trim() && !imageFile && !audioBlob)
                                            ? 'opacity-50 cursor-not-allowed border-gray-400'
                                            : isDarkMode
                                                ? 'text-gray-300 border-gray-600 hover:text-gray-200 hover:bg-gray-700'
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                    } active:scale-95`}
                                    type="button"
                                >
                                    {isSubmitting ? (
                                        <MdRefresh className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <TiArrowUpThick className="w-4 h-4" />
                                    )}
                                </button>
                            </Tooltip>
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
                            className="max-w-xs max-h-48 object-contain rounded-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={onImagePreviewClick}
                        />
                        <button
                            onClick={handleRemoveImage}
                            className={`absolute -top-2 -right-2 p-1 rounded-full transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            } shadow-lg hover:shadow-xl`}
                        >
                            <FaTimesCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Enhanced Audio Preview */}
            {audioBlob && audioUrl && (
                <div className="mt-4 mx-2 md:mx-0">
                    <div className={`p-4 rounded-lg border-2 border-dashed transition-all ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                    }`}>
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onTimeUpdate={handleAudioTimeUpdate}
                            onLoadedMetadata={handleAudioLoadedMetadata}
                            onEnded={handleAudioEnded}
                            onError={handleAudioError}
                            onLoadStart={() => {
                                console.log('🎵 Audio loading started');
                                setIsAudioLoading(true);
                            }}
                            onCanPlay={() => {
                                console.log('✅ Audio can play - ready for playback');
                                setIsAudioLoading(false);
                                
                                // Ensure audio is not muted and volume is set
                                if (audioRef.current) {
                                    audioRef.current.muted = false;
                                    audioRef.current.volume = 1.0;
                                    console.log('🔊 Audio settings:', {
                                        muted: audioRef.current.muted,
                                        volume: audioRef.current.volume,
                                        readyState: audioRef.current.readyState,
                                        src: audioRef.current.src
                                    });
                                }
                            }}
                            preload="metadata"
                            controls={false}
                        />
                        
                        {/* Audio player header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FaVolumeUp className="w-5 h-5 text-blue-500" />
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Audio Recording
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {Math.round(audioBlob.size / 1024)}KB
                                </span>
                                {audioError && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                        Error
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleRemoveAudio}
                                className={`p-1 rounded-full transition-all ${
                                    isDarkMode 
                                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <FaTimesCircle className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Audio controls */}
                        <div className="flex items-center gap-3 mb-3">
                            <button
                                onClick={isPlaying ? handlePauseAudio : handlePlayAudio}
                                disabled={isAudioLoading || !!audioError}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                    isAudioLoading || audioError
                                        ? 'opacity-50 cursor-not-allowed bg-gray-400'
                                        : isDarkMode 
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } shadow-lg hover:shadow-xl transform hover:scale-105`}
                            >
                                {isAudioLoading ? (
                                    <MdRefresh className="w-4 h-4 animate-spin" />
                                ) : isPlaying ? (
                                    <FaPause className="w-4 h-4" />
                                ) : (
                                    <FaPlay className="w-4 h-4 ml-0.5" />
                                )}
                            </button>
                            
                            {/* Transcribe Button */}
                            <Tooltip text={isTranscribing ? "Transcribing..." : "Transcribe Audio to Text"}>
                                <button
                                    onClick={transcribeAudio}
                                    disabled={isTranscribing || !!audioError}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                        isTranscribing || audioError
                                            ? 'opacity-50 cursor-not-allowed bg-gray-400'
                                            : isDarkMode 
                                                ? 'bg-green-600 hover:bg-green-500 text-white' 
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                    } shadow-lg hover:shadow-xl transform hover:scale-105`}
                                >
                                    {isTranscribing ? (
                                        <MdRefresh className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FaFileAlt className="w-4 h-4" />
                                    )}
                                </button>
                            </Tooltip>
                            
                            {/* Transcription Status */}
                            {isTranscribing && (
                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                    <MdRefresh className="w-3 h-3 animate-spin" />
                                    Transcribing...
                                </div>
                            )}
                            
                            {/* Transcription Completed Status */}
                            {transcriptionText && !isTranscribing && isTranscriptionComplete && (
                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                    <FaFileAlt className="w-3 h-3" />
                                    Ready to use
                                </div>
                            )}
                            
                            {/* Manual Input Mode Status */}
                            {showTranscription && !transcriptionText && !isTranscribing && (
                                <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                                    <FaFileAlt className="w-3 h-3" />
                                    Manual input mode
                                </div>
                            )}
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-mono min-w-[2.5rem] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatTime(currentTime)}
                                    </span>
                                    <div className="flex-1 relative">
                                        <div className={`w-full h-2 rounded-full cursor-pointer ${
                                            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                        }`} onClick={handleSeek}>
                                            <div 
                                                className="h-full rounded-full transition-all duration-100 bg-blue-500"
                                                style={{ width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-xs font-mono min-w-[2.5rem] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatTime(audioDuration)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Transcription Section */}
                        {showTranscription && (
                            <div className="mt-3 p-3 border-2 border-dashed rounded-lg transition-all ${
                                isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-400 bg-green-50'
                            }">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaFileAlt className="w-4 h-4 text-green-500" />
                                    <span className={`text-sm font-medium ${
                                        isDarkMode ? 'text-green-300' : 'text-green-700'
                                    }`}>
                                        Audio Transcription
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-200 text-green-800'
                                    }`}>
                                        {transcriptionText ? 'Ready' : 'Manual Input'}
                                    </span>
                                </div>
                                
                                <textarea
                                    value={transcriptionText}
                                    onChange={(e) => setTranscriptionText(e.target.value)}
                                    placeholder={transcriptionText ? "Edit the transcribed text if needed..." : "Type what you said in the audio recording..."}
                                    className={`w-full p-2 rounded-lg border resize-none ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                                    }`}
                                    rows={3}
                                />
                                
                                {transcriptionError && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-700">
                                        <div className="flex items-center gap-2">
                                            <FaTimesCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-xs text-red-700 dark:text-red-300">{transcriptionError}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleTranscriptionSubmit}
                                        disabled={!transcriptionText.trim()}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            !transcriptionText.trim()
                                                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
                                                : isDarkMode
                                                    ? 'bg-green-600 hover:bg-green-500 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                    >
                                        {transcriptionText.trim() ? 'Use as Question' : 'Type and submit'}
                                    </button>
                                    <button
                                        onClick={handleTranscriptionCancel}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            isDarkMode
                                                ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Volume controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleMuteToggle}
                                className={`p-1 rounded-full transition-all ${
                                    isDarkMode 
                                        ? 'text-gray-400 hover:text-gray-300' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {isMuted ? <FaVolumeOff className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`
                                }}
                            />
                        </div>
                        
                        {/* Transcription Available Hint */}
                        {audioBlob && !showTranscription && !isTranscribing && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-700">
                                <div className="flex items-center gap-2">
                                    <FaFileAlt className="w-3 h-3 text-blue-500" />
                                    <span className="text-xs text-blue-700 dark:text-blue-300">
                                        Click the green transcribe button to convert your audio to text. The transcribed text will be used as your question.
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {/* Error display */}
                        {audioError && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <span className="text-xs text-red-700">{audioError}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionInput;
