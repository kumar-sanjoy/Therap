import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, EXAM_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../../../config';
import { useDarkTheme } from '../../Common/DarkThemeProvider';


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
            

            
            // Real API call
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

    // Helper function to convert Bengali numerals to Arabic numerals
    const convertBengaliToArabic = (bengaliText) => {
        const bengaliToArabic = {
            '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
            '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
        };
        return bengaliText.split('').map(char => bengaliToArabic[char] || char).join('');
    };

    // Helper function to extract score from response text
    const extractScoreFromResponse = (responseText) => {
        if (!responseText || typeof responseText !== 'string') return null;
        
        // Look for Bengali score pattern: নম্বর: ০/১০
        let scoreMatch = responseText.match(/নম্বর:\s*(\d+)\/10/);
        if (!scoreMatch) {
            // Also try English pattern: Score: 0/10
            scoreMatch = responseText.match(/Score:\s*(\d+)\/10/i);
        }
        if (!scoreMatch) {
            // Try to find any number followed by /10
            scoreMatch = responseText.match(/(\d+)\/10/);
        }
        if (!scoreMatch) {
            // Try to find Bengali numerals followed by /১০
            scoreMatch = responseText.match(/নম্বর:\s*([০-৯]+)\/১০/);
            if (scoreMatch) {
                // Convert Bengali numerals to Arabic numerals
                const arabicScore = convertBengaliToArabic(scoreMatch[1]);
                const extractedScore = parseInt(arabicScore);
                                  return extractedScore;
            }
        }
        
        if (scoreMatch) {
            const extractedScore = parseInt(scoreMatch[1]);
                          return extractedScore;
        } else {
                          return null;
        }
    };

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
            // Real API call
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

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to submit answer');
            }

            let data;
            try {
                data = await res.json();
                
                // Debug: Log the response data to understand the format
                                                                                                                                                                                                } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                                  throw new Error('Server returned invalid response format');
            }
            
            // Check for various success indicators in the response
            if (data.success === true || data.status === 'success' || data.message === 'success' || res.status === 200) {
                // Use the actual response content if available, otherwise fallback to feedback/message
                // Try to find the response content in various possible locations
                let feedbackContent = data.response;
                if (!feedbackContent) {
                    feedbackContent = data.feedback || data.message || data.result || 'Submitted successfully!';
                }
                setFeedback(feedbackContent);
                
                // Try to extract score from various possible locations
                if (data.score !== undefined) {
                    setScore(data.score);
                } else if (data.response && typeof data.response === 'string') {
                    const extractedScore = extractScoreFromResponse(data.response);
                    if (extractedScore !== null) {
                        setScore(extractedScore);
                    }
                } else if (data.feedback && typeof data.feedback === 'string') {
                    const extractedScore = extractScoreFromResponse(data.feedback);
                    if (extractedScore !== null) {
                        setScore(extractedScore);
                    }
                } else if (data.message && typeof data.message === 'string') {
                    const extractedScore = extractScoreFromResponse(data.message);
                    if (extractedScore !== null) {
                        setScore(extractedScore);
                    }
                }
                setShowFeedback(true);
            } else if (data.message && data.message !== 'success') {
                // If there's a specific error message from server, show it
                throw new Error(data.message);
            } else if (res.status === 200) {
                // If no clear success/error indicator but status is 200, assume success
                // Try to find the response content in various possible locations
                let feedbackContent = data.response;
                if (!feedbackContent) {
                    feedbackContent = data.feedback || data.message || data.result || 'Answer submitted successfully!';
                }
                setFeedback(feedbackContent);
                
                if (data.score !== undefined) {
                    setScore(data.score);
                } else if (data.response && typeof data.response === 'string') {
                    const extractedScore = extractScoreFromResponse(data.response);
                    if (extractedScore !== null) {
                        setScore(extractedScore);
                    }
                } else if (data.feedback && typeof data.feedback === 'string') {
                    const extractedScore = extractScoreFromResponse(data.feedback);
                    if (extractedScore !== null) {
                        setScore(extractedScore);
                    }
                } else if (data.message && typeof data.message === 'string') {
                    const extractedScore = extractScoreFromResponse(data.message);
                    if (extractedScore !== null) {
                        setScore(extractedScore);
                    }
                }
                setShowFeedback(true);
            } else {
                // Fallback for unexpected response format
                console.warn('Unexpected response format:', data);
                // Try to find the response content in various possible locations
                let feedbackContent = data.response;
                if (!feedbackContent) {
                    feedbackContent = data.feedback || data.message || data.result || 'Answer submitted successfully!';
                }
                setFeedback(feedbackContent);
                setShowFeedback(true);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Check for specific error types
            if (error.name === 'TypeError' && error.message.includes('Load failed')) {
                setError('Network error: Unable to connect to the server. Please check your connection and try again.');
            } else if (error.message.includes('CORS')) {
                setError('CORS error: Server configuration issue. Please contact support.');
            } else if (error.message === 'Failed to submit answer') {
                setError('Server response format issue. Please check console for details and contact support.');
            } else {
                setError(error.message || 'Something went wrong. Please try again.');
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

    // Show loading state
    if (isLoadingQuestion) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>

                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Loading Written Question
                        </h2>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Please wait while we prepare your question...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                    score={score}
                    onReset={reset}
                />
            </div>
            

        </div>
    );
};

export default WrittenQuestionModular;
