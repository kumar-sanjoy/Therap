import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../../../config';
import { useDarkTheme } from '../../Common/DarkThemeProvider';

import TypingIndicator from '../../Common/TypingIndicator';

// Import sub-components
import Header from './Header';
import QuestionInput from './QuestionInput';
import ImagePreview from './ImagePreview';
import LoadingState from './LoadingState';
import AnswerDisplay from './AnswerDisplay';

const AskQuestionNew = () => {
    
    const navigate = useNavigate();
    const { isDarkMode } = useDarkTheme();
    
    // State management
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [showTypingIndicator, setShowTypingIndicator] = useState(false);

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

    const handleSubmit = async () => {
        // Check if we have at least one input: question text, image, or audio
        const hasQuestion = question.trim();
        const hasImage = imageFile;
        const hasAudio = audioBlob;
        
        if (!hasQuestion && !hasImage && !hasAudio) {
            setErrorMessage('Please enter a question, upload an image, or record audio.');
            return;
        }
        
        // If we have audio but no transcribed question, we need to transcribe first
        if (hasAudio && !hasQuestion) {
            setErrorMessage('Please transcribe your audio recording before submitting.');
            return;
        }
        
        // If we have a question (either typed or transcribed), we can proceed
        // Audio blob will not be sent to backend when we have transcribed text

        setIsSubmitting(true);
        setError(null);
        setShowAnswer(false);

        try {
            let data;
            
            // Real API call
            const formData = new FormData();
            
            // Add question text
            if (question.trim()) {
                formData.append('question', question.trim());
            }
            
            // Add image file
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            // Add audio file only if no transcribed text is available
            if (audioBlob && !question.trim()) {
                formData.append('audio', audioBlob, 'recording.wav');
            }

            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

            const response = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.ASK_QUESTION}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            data = await response.json();
            
            if (data.status === 'success') {
                // Show typing indicator first
                setShowTypingIndicator(true);
                
                // Hide typing indicator and show answer after a delay
                setTimeout(() => {
                    setShowTypingIndicator(false);
                    setAnswer(data.response || data.answer || 'No answer received');
                    setShowAnswer(true);
                    setErrorMessage('');
                }, 2000); // 2 second delay to show typing
            } else {
                throw new Error(data.message || 'Failed to get answer');
            }

        } catch (error) {
            console.error('Error submitting question:', error);
            setError(error.message || 'Failed to submit question. Please try again.');
            setErrorMessage(error.message || 'Failed to submit question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImagePreviewClick = () => {
        setShowImageModal(true);
    };

    const handleTextSelect = (selectedText) => {
        setQuestion(`Can you explain this: "${selectedText}"`);
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

            
            {/* Header */}
            <Header navigate={navigate} />

            {/* Main Content */}
            <div className="pt-4">
                {/* Question Input */}
                <QuestionInput
                    question={question}
                    setQuestion={setQuestion}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    imageFile={imageFile}
                    setImageFile={setImageFile}
                    imagePreview={imagePreview}
                    setImagePreview={setImagePreview}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    audioBlob={audioBlob}
                    setAudioBlob={setAudioBlob}
                    onImagePreviewClick={handleImagePreviewClick}
                    onTranscriptionComplete={(transcript) => {
                        setQuestion(transcript);
                        setErrorMessage('');
                    }}
                />

                {/* Loading State */}
                <LoadingState isSubmitting={isSubmitting} />

                {/* Answer Display */}
                <AnswerDisplay 
                    showAnswer={showAnswer}
                    question={question}
                    answer={answer}
                    onTextSelect={handleTextSelect}
                />
                
                {/* Typing Indicator */}
                {showTypingIndicator && <TypingIndicator isVisible={true} />}
            </div>

            {/* Image Preview Modal */}
            <ImagePreview
                imagePreview={imagePreview}
                showImageModal={showImageModal}
                setShowImageModal={setShowImageModal}
            />
            
        </div>
    );
};

export default AskQuestionNew;
