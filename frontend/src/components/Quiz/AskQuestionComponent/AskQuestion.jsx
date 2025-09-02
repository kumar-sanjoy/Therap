import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, LEARNING_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../../../config';
import { useDarkTheme } from '../../Common/DarkThemeProvider.jsx';
import TeacherAssistant from '../../Common/TeacherAssistant';
import TypingIndicator from '../../Common/TypingIndicator';

// Import sub-components
import Header from './Header';
import QuestionInput from './QuestionInput';
import ImagePreview from './ImagePreview';
import LoadingState from './LoadingState';
import AnswerDisplay from './AnswerDisplay';

const AskQuestionNew = () => {
    console.log('🔍 [ASK_QUESTION DEBUG] AskQuestion component is loading...');
    console.error('🔍 [ASK_QUESTION DEBUG] ERROR TEST - AskQuestion component is loading...');
    
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
        if (!question.trim() && !imageFile && !audioBlob) {
            setErrorMessage('Please enter a question, upload an image, or record audio.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setShowAnswer(false);

        try {
            const formData = new FormData();
            
            // Add question text
            if (question.trim()) {
                formData.append('question', question.trim());
            }
            
            // Add image file
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            // Add audio file
            if (audioBlob) {
                formData.append('audio', audioBlob, 'recording.wav');
            }

            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

            console.log('🔍 [ASK_QUESTION DEBUG] About to make fetch request to:', `${LEARNING_API_BASE_URL}${API_ENDPOINTS.ASK_QUESTION}`);
            
            let response;
            try {
                response = await fetch(`${LEARNING_API_BASE_URL}${API_ENDPOINTS.ASK_QUESTION}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData
                });
                console.log('🔍 [ASK_QUESTION DEBUG] Fetch request completed successfully');
            } catch (fetchError) {
                console.error('🔍 [ASK_QUESTION DEBUG] Fetch request failed:', fetchError);
                console.error('🔍 [ASK_QUESTION DEBUG] Fetch error details:', {
                    name: fetchError.name,
                    message: fetchError.message,
                    stack: fetchError.stack
                });
                throw fetchError;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Show typing indicator first
                setShowTypingIndicator(true);
                
                // Hide typing indicator and show answer after a delay
                setTimeout(() => {
                    setShowTypingIndicator(false);
                    setAnswer(data.answer || data.response || 'No answer received');
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
                />

                {/* Loading State */}
                <LoadingState isSubmitting={isSubmitting} />

                {/* Answer Display */}
                <AnswerDisplay 
                    showAnswer={showAnswer}
                    question={question}
                    answer={answer}
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
