import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCamera, FaQuestionCircle, FaLightbulb, FaUpload, FaCheckCircle, FaTimesCircle, FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa';
import flowLogo from '../assets/flow-main-nobg.png';
import TextDisplay from "./TextDisplay";
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, DEV_MODE } from '../config';

const AskQuestion = () => {
    const navigate = useNavigate();
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
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef(null);

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

    const handleMediaClick = () => {
        fileInputRef.current.click();
    };

    // Voice recording functions
    const startRecording = async () => {
        try {
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
            if (error.name === 'NotSupportedError') {
                setError('Audio recording is not supported in this browser. Please try typing your question.');
            } else if (error.name === 'NotAllowedError') {
                setError('Microphone access denied. Please allow microphone permissions and try again.');
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
            if (DEV_MODE) {
                // Mock transcription for development
                await new Promise(resolve => setTimeout(resolve, 2000));
                const mockTranscription = "This is a mock transcription of your voice input. In a real implementation, this would be the actual transcribed text from your audio.";
                setTranscription(mockTranscription);
                setQuestion(prev => prev + (prev ? ' ' : '') + mockTranscription);
            } else {
                // Real transcription using Web Speech API or external service
                const formData = new FormData();

                // Determine file extension based on MIME type
                let fileExtension = 'webm';
                if (audioBlob.type.includes('mp4')) {
                    fileExtension = 'mp4';
                } else if (audioBlob.type.includes('ogg')) {
                    fileExtension = 'ogg';
                } else if (audioBlob.type.includes('wav')) {
                    fileExtension = 'wav';
                }

                formData.append('audio', audioBlob, `recording.${fileExtension}`);

                const response = await fetch(`${API_BASE_URL}/transcribe`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setTranscription(data.transcription);
                    setQuestion(prev => prev + (prev ? ' ' : '') + data.transcription);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Transcription failed');
                }
            }
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

        try {
            if (DEV_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Generate mock answer based on the question and image
                const mockAnswer = generateMockAnswer(question.trim(), selectedSubject, imageFile);
                setAnswer(mockAnswer);
                setShowAnswer(true);
            } else {
                const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
                if (!userId) {
                    navigate('/login');
                    return;
                }

                // Use FormData to handle both text and image
                const formData = new FormData();
                formData.append('question', question.trim());

                // Add image if uploaded
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLEAR_DOUBT}`, {
                    method: 'POST',
                    body: formData, // Send FormData instead of JSON
                });

                if (response.ok) {
                    const data = await response.json();
                    setAnswer(data.answer);
                    setShowAnswer(true);
                } else {
                    const data = await response.json();
                    setError(data.message || 'Failed to get answer');
                }
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to generate mock answers based on question content and subject
    const generateMockAnswer = (question, subject, imageFile) => {
        const questionLower = question.toLowerCase();

        // Physics answers
        if (questionLower.includes('newton') || questionLower.includes('force') || questionLower.includes('motion')) {
            return `**Newton's Laws of Motion:**

**First Law (Law of Inertia):**
An object remains at rest or in uniform motion unless acted upon by an external force. This means objects naturally resist changes in their state of motion.

**Second Law:**
Force equals mass times acceleration (F = ma). The greater the mass, the more force is needed to accelerate it.

**Third Law:**
For every action, there is an equal and opposite reaction. When you push against a wall, the wall pushes back with equal force.

**Real-world Example:**
When you're in a car that suddenly stops, your body continues moving forward due to inertia (First Law). The seatbelt applies a force to stop you (Second Law), and you feel the seatbelt's force pushing back against you (Third Law).`;
        }

        if (questionLower.includes('gravity') || questionLower.includes('gravitational')) {
            return `**Gravitation:**

**Universal Law of Gravitation:**
Every object in the universe attracts every other object with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between them.

**Formula:** F = G(m₁m₂)/r²
Where G is the universal gravitational constant (6.67 × 10⁻¹¹ Nm²/kg²)

**Key Points:**
• Gravity is always attractive
• Force decreases with distance squared
• All objects have gravitational pull
• Earth's gravity is 9.8 m/s²

**Interesting Fact:**
Even though you're much smaller than Earth, you still exert a gravitational force on it! However, it's so small that it's negligible compared to Earth's pull on you.`;
        }

        if (questionLower.includes('electricity') || questionLower.includes('current') || questionLower.includes('voltage')) {
            return `**Electricity Fundamentals:**

**Electric Current:**
Flow of electric charges through a conductor. Measured in Amperes (A).

**Voltage (Electric Potential):**
The electrical pressure that drives current flow. Measured in Volts (V).

**Resistance:**
Opposition to current flow. Measured in Ohms (Ω).

**Ohm's Law:** V = IR
Voltage equals current times resistance.

**Series Circuit:**
• Same current flows through all components
• Total voltage is sum of individual voltages
• Total resistance is sum of individual resistances

**Parallel Circuit:**
• Same voltage across all components
• Total current is sum of individual currents
• Total resistance is less than smallest individual resistance

**Safety Note:**
Always be careful with electricity. Never touch electrical components with wet hands!`;
        }

        // Chemistry answers
        if (questionLower.includes('acid') || questionLower.includes('base') || questionLower.includes('ph')) {
            return `**Acids and Bases:**

**Acids:**
• Sour taste
• Turn blue litmus paper red
• Conduct electricity
• pH less than 7
• Examples: HCl, H₂SO₄, CH₃COOH

**Bases:**
• Bitter taste
• Turn red litmus paper blue
• Slippery to touch
• pH greater than 7
• Examples: NaOH, KOH, Ca(OH)₂

**pH Scale:**
• 0-6: Acidic
• 7: Neutral
• 8-14: Basic

**Neutralization Reaction:**
Acid + Base → Salt + Water
Example: HCl + NaOH → NaCl + H₂O

**Indicators:**
• Litmus paper
• Phenolphthalein
• Universal indicator

**Real-world Applications:**
• Antacids neutralize stomach acid
• Soap is basic
• Lemon juice is acidic`;
        }

        if (questionLower.includes('chemical') || questionLower.includes('reaction') || questionLower.includes('equation')) {
            return `**Chemical Reactions and Equations:**

**Chemical Reaction:**
A process where substances transform into new substances with different properties.

**Types of Reactions:**

**1. Combination Reaction:**
A + B → AB
Example: 2H₂ + O₂ → 2H₂O

**2. Decomposition Reaction:**
AB → A + B
Example: 2H₂O₂ → 2H₂O + O₂

**3. Displacement Reaction:**
A + BC → AC + B
Example: Fe + CuSO₄ → FeSO₄ + Cu

**4. Double Displacement:**
AB + CD → AD + CB
Example: AgNO₃ + NaCl → AgCl + NaNO₃

**Balancing Equations:**
• Number of atoms must be equal on both sides
• Use coefficients to balance
• Never change subscripts

**Conservation of Mass:**
Mass is neither created nor destroyed in a chemical reaction.`;
        }

        // Biology answers
        if (questionLower.includes('cell') || questionLower.includes('mitochondria') || questionLower.includes('nucleus')) {
            return `**Cell Structure and Function:**

**Cell Theory:**
• All living organisms are made up of cells
• Cell is the basic structural and functional unit
• All cells arise from pre-existing cells

**Key Organelles:**

**Nucleus:**
• Control center of the cell
• Contains genetic material (DNA)
• Surrounded by nuclear membrane

**Mitochondria:**
• Powerhouse of the cell
• Produces energy through cellular respiration
• Has its own DNA

**Endoplasmic Reticulum:**
• Transport system of the cell
• Rough ER: Has ribosomes, makes proteins
• Smooth ER: Makes lipids, detoxifies

**Golgi Apparatus:**
• Packaging and secretion center
• Modifies and packages proteins

**Lysosomes:**
• Digestive enzymes
• Breaks down waste and foreign materials

**Vacuoles:**
• Storage and waste disposal
• Large in plant cells, small in animal cells`;
        }

        if (questionLower.includes('photosynthesis') || questionLower.includes('chloroplast')) {
            return `**Photosynthesis:**

**Definition:**
Process by which plants convert light energy into chemical energy (glucose).

**Equation:**
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂

**Two Stages:**

**1. Light-Dependent Reactions:**
• Occurs in thylakoid membranes
• Uses light energy to split water
• Produces oxygen, ATP, and NADPH

**2. Light-Independent Reactions (Calvin Cycle):**
• Occurs in stroma
• Uses ATP and NADPH to fix CO₂
• Produces glucose

**Requirements:**
• Sunlight
• Carbon dioxide
• Water
• Chlorophyll

**Products:**
• Glucose (food for plant)
• Oxygen (released into atmosphere)

**Importance:**
• Provides food for all living organisms
• Maintains oxygen levels in atmosphere
• Basis of food chains`;
        }

        // Math answers
        if (questionLower.includes('algebra') || questionLower.includes('equation') || questionLower.includes('solve')) {
            return `**Algebraic Problem Solving:**

**Linear Equations:**
Equations with variables raised to the power of 1.

**Example:** 2x + 3 = 7
**Solution:**
1. Subtract 3 from both sides: 2x = 4
2. Divide both sides by 2: x = 2

**Quadratic Equations:**
Equations with variables raised to the power of 2.

**Standard Form:** ax² + bx + c = 0

**Methods to Solve:**
1. **Factoring:** Find factors that multiply to give the equation
2. **Quadratic Formula:** x = (-b ± √(b² - 4ac)) / 2a
3. **Completing the Square:** Convert to perfect square form

**Example:** x² - 5x + 6 = 0
**Solution by Factoring:**
(x - 2)(x - 3) = 0
x = 2 or x = 3

**Key Tips:**
• Always check your answer by substituting back
• Remember to consider both positive and negative solutions
• Practice makes perfect!`;
        }

        // General science
        if (questionLower.includes('atom') || questionLower.includes('molecule') || questionLower.includes('element')) {
            return `**Atomic Structure:**

**Atom:**
The smallest unit of an element that retains its properties.

**Structure:**
• **Nucleus:** Contains protons and neutrons
• **Electrons:** Orbit around the nucleus in shells

**Subatomic Particles:**
• **Protons:** Positive charge, mass = 1 amu
• **Neutrons:** No charge, mass = 1 amu
• **Electrons:** Negative charge, mass ≈ 0 amu

**Atomic Number:**
Number of protons (determines the element)

**Mass Number:**
Number of protons + neutrons

**Isotopes:**
Atoms of the same element with different numbers of neutrons

**Molecule:**
Two or more atoms chemically bonded together

**Element:**
Pure substance made of only one type of atom

**Compound:**
Substance made of two or more different elements chemically combined`;
        }

        // Default answer for unrecognized questions
        return `I understand you're asking about "${question}". This is a great question that shows you're thinking critically about the subject.

**General Approach to Answering Questions:**

**1. Break Down the Question:**
• Identify key terms and concepts
• Understand what's being asked
• Look for context clues

**2. Apply Relevant Concepts:**
• Use your knowledge of the subject
• Connect to related topics you've learned
• Consider real-world applications

**3. Structure Your Answer:**
• Start with a clear definition or explanation
• Provide examples or evidence
• Conclude with a summary

**4. Verify Your Understanding:**
• Check if your answer makes sense
• Consider alternative perspectives
• Ask follow-up questions if needed

**Study Tip:**
When you encounter questions like this, try to:
• Draw diagrams or mind maps
• Explain the concept to someone else
• Practice with similar problems
• Review related topics

Would you like me to help you break down this question further or explore related concepts?`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gray-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-gray-700 text-lg mt-6 font-medium">Analyzing your question...</p>
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
                        <FaQuestionCircle className="text-[#343434]" />
                        Clear Your Doubts
                    </h1>
                    <p className="text-gray-600 text-lg">Ask any question and get instant AI-powered answers</p>
                </div>

                {/* Error Messages */}
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

                {errorMessage && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Question Input Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-[#343434] mb-6 flex items-center gap-2">
                        <FaLightbulb className="text-[#343434]" />
                        Ask Your Question
                    </h2>

                    <div className="space-y-6">
                        {/* Text Input */}
                        <div className="relative">
                            <textarea
                                placeholder="Type your question here... (You can also upload an image or record your voice below)"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#343434]/50 focus:border-transparent transition-all duration-300 resize-none min-h-[120px] max-h-[300px] bg-white/50 backdrop-blur-sm shadow-sm"
                                rows={4}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
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
                                {isRecording && (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        disabled={isTranscribing}
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

                                {isTranscribing && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm">Transcribing...</span>
                                    </div>
                                )}
                            </div>

                            {transcription && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-600 mb-1">Transcription:</p>
                                    <p className="text-[#343434] font-medium">{transcription}</p>
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
                        disabled={isSubmitting || (!question.trim() && !imageFile)}
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
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-[#343434] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#343434]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Answer
                        </h2>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                            <TextDisplay content={answer} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskQuestion;