import React, { useState, useRef, useEffect } from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCamera, FaQuestionCircle, FaUpload, FaCheckCircle, FaTimesCircle, FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa';
import TextDisplay from "./TextDisplay";
import '../css/AskQuestionMinimal.css';

const AskQuestionMinimal = () => {
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Hardcoded bearer token for demonstration
  const BEARER_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYW5qb3kiLCJpYXQiOjE3NTQ1NTY4NjcsImV4cCI6MTc1NDY0MzI2N30.ZIlJMLJ2HzfMZTVRB7lGK4D7hRKBhLwETqm7OG6JOohoPDpChx1DLB0jYTYQ9U3h466GQPSkM-fik2ugeO1yAg';

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
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleMediaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      console.log('🔍 [AUDIO DEBUG] Starting audio recording...');
      console.log('🔍 [AUDIO DEBUG] navigator.mediaDevices:', navigator.mediaDevices);
      console.log('🔍 [AUDIO DEBUG] window.isSecureContext:', window.isSecureContext);
      console.log('🔍 [AUDIO DEBUG] User Agent:', navigator.userAgent);
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices) {
        console.error('🔍 [AUDIO DEBUG] navigator.mediaDevices is undefined');
        throw new Error('MediaDevices API is not supported in this browser');
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        console.error('🔍 [AUDIO DEBUG] navigator.mediaDevices.getUserMedia is undefined');
        
        // Check for legacy getUserMedia support
        if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) {
          console.log('🔍 [AUDIO DEBUG] Legacy getUserMedia found, but not supported in this implementation');
          throw new Error('Legacy MediaDevices API detected but not supported. Please use a modern browser.');
        }
        
        throw new Error('MediaDevices API is not supported in this browser');
      }
      
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        console.error('🔍 [AUDIO DEBUG] Not in secure context');
        throw new Error('MediaDevices API requires a secure context (HTTPS or localhost)');
      }
      
      console.log('🔍 [AUDIO DEBUG] All checks passed, requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check for supported MIME types
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];

      let selectedMimeType = null;
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio format found');
      }

      console.log('Using MIME type:', selectedMimeType);

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
        setIsTranscribing(true);

        // Transcribe the audio
        await transcribeAudio(audioBlob);

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
      
      if (error.message.includes('MediaDevices API is not supported')) {
        setError('Audio recording is not supported in this browser. Please try typing your question.');
      } else if (error.message.includes('secure context')) {
        setError('Audio recording requires HTTPS or localhost. Please use a secure connection.');
      } else if (error.name === 'NotSupportedError') {
        setError('Audio recording is not supported in this browser. Please try typing your question.');
      } else if (error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        setError('Microphone is already in use by another application. Please close other apps using the microphone.');
      } else {
        setError('Could not access microphone. Please check permissions and try again.');
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

  const transcribeAudio = async (audioBlob) => {
    try {
      // For minimal version, we'll use a mock transcription
      // In a real implementation, you would send the audio to a transcription service
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTranscription = "This is a mock transcription of your voice input. In a real implementation, this would be the actual transcribed text from your audio.";
      setTranscription(mockTranscription);
      setQuestion(prev => prev + (prev ? ' ' : '') + mockTranscription);
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Failed to transcribe audio. Please try typing your question.');
    } finally {
      setIsTranscribing(false);
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
    if (!question.trim() && !imageFile) {
      setError('Please enter your question or upload an image');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const API_URL = 'http://localhost:8080/learn/doubts';

    try {
      const formData = new FormData();
      if (question.trim()) {
        formData.append('question', question.trim());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer);
        setShowAnswer(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Failed to get an answer from the server.');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Something went wrong. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doubt-container">
      <div className="doubt-header">
        <IoMdArrowRoundBack className="back-icon" />
        <h2 className="doubt-title">Ask a Question</h2>
      </div>

      <div className="doubt-content">
        {!showAnswer ? (
          <form onSubmit={handleSubmit} className="doubt-form">
            <div className="input-area">
              <textarea
                className="question-textarea"
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isRecording || isTranscribing}
              ></textarea>

              <div className="media-buttons">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleMediaClick}
                  className="icon-button"
                  title="Upload an image"
                >
                  <FaCamera />
                </button>
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="icon-button microphone-button"
                    title="Start voice recording"
                    disabled={!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia}
                  >
                    <FaMicrophone />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="icon-button stop-button"
                    title="Stop voice recording"
                  >
                    <FaStop />
                  </button>
                )}
              </div>

              {/* Browser Compatibility Info */}
              {(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) && (
                <div className="browser-compatibility-warning">
                  ⚠️ Audio recording not supported in this browser
                </div>
              )}
            </div>

            {isRecording && (
              <div className="recording-status">
                <FaMicrophoneSlash className="recording-icon" />
                <span className="recording-text">Recording...</span>
                <span className="recording-timer">{formatTime(recordingTime)}</span>
              </div>
            )}

            {isTranscribing && (
              <div className="recording-status">
                <FaQuestionCircle className="transcribing-icon" />
                <span className="recording-text">Transcribing audio...</span>
              </div>
            )}

            {transcription && (
              <div className="transcription-container">
                <p className="transcription-label">Transcription:</p>
                <p className="transcription-text">{transcription}</p>
              </div>
            )}

            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button type="button" onClick={handleRemoveImage} className="remove-image-button">
                  <FaTimesCircle />
                </button>
              </div>
            )}

            {errorMessage && (
              <p className="error-message">{errorMessage}</p>
            )}

            {error && (
              <p className="error-message">{error}</p>
            )}

            <button type="submit" className="submit-button" disabled={isRecording || isTranscribing || isSubmitting}>
              {isSubmitting ? 'Submitting...' : <><FaQuestionCircle /> Ask</>}
            </button>
          </form>
        ) : (
          <div className="answer-section">
            <div className="answer-header">
              <FaCheckCircle className="answer-icon" />
              <h3 className="answer-title">Answer</h3>
            </div>
            <TextDisplay text={answer} />
            <button
              onClick={() => {
                setShowAnswer(false);
                setQuestion('');
                handleRemoveImage();
                setAnswer('');
              }}
              className="new-question-button"
            >
              Ask another question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskQuestionMinimal; 