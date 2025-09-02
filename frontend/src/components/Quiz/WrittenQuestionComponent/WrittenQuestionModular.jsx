import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../../../config';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import TeacherAssistant from '../../Common/TeacherAssistant';

// Import sub-components
import Header from './Header';
import PageHeader from './PageHeader';
import ErrorDisplay from './ErrorDisplay';
import QuestionCard from './QuestionCard';
import UploadSection from './UploadSection';
import SubmitButton from './SubmitButton';
import FeedbackSection from './FeedbackSection';
import LoadingOverlay from './LoadingOverlay';

const WrittenQuestionModular = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useDarkTheme();
    
    // State management
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

    // Helper functions
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
            <LoadingOverlay isSubmitting={isSubmitting} />
            
            <Header navigate={navigate} />

            {/* Main Content */}
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <PageHeader />
                
                <ErrorDisplay error={error} />
                
                <QuestionCard 
                    question={question} 
                    isLoadingQuestion={isLoadingQuestion} 
                />
                
                <UploadSection
                    onImageChange={handleImageChange}
                    image={image}
                    previewURL={previewURL}
                    onRemoveImage={removeImage}
                    isSubmitting={isSubmitting}
                    isLoadingQuestion={isLoadingQuestion}
                />
                
                <SubmitButton
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    image={image}
                    isLoadingQuestion={isLoadingQuestion}
                />
                
                <FeedbackSection
                    showFeedback={showFeedback}
                    feedback={feedback}
                    onReset={reset}
                />
            </div>
            
            {/* Teacher Assistant */}
            <TeacherAssistant 
                context="quiz"
                currentQuestion="Written Question"
                showFloatingAvatar={false}
            />
        </div>
    );
};

export default WrittenQuestionModular;
