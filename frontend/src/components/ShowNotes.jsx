import React, { useState, useEffect, useRef } from 'react';
import TextDisplay from "./TextDisplay";
import { useLocation, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { PDFDownloadLink } from '@react-pdf/renderer';
import '../css/ShowNotes.css';
import flowLogo from '../assets/flow-main-nobg.png';
import flowLogoDark from '../assets/flow-dark.png';
import { LEARNING_API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, mapClassForExamAPI, mapSubjectForExamAPI } from '../config';
import { FaDownload, FaVolumeUp, FaPause, FaStop } from 'react-icons/fa';
import { GrNotes } from "react-icons/gr";
import NotesPDF from './NotesPDF';
import { useDarkTheme } from './DarkThemeProvider';

const ShowNotes = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();
  const skipInitialLoading = state?.skipInitialLoading;
  const [isLoading, setIsLoading] = useState(!skipInitialLoading); // Only show loading if we need to fetch data
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const utteranceRef = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    
    if (!token || !username) {
      navigate('/login');
      return;
    }
    
    // Check if user has the correct role for this page (ShowNotes is student-only)
    if (role !== 'STUDENT') {
      if (role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/login');
      }
      return;
    }
  }, [navigate]);

  // Load available voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Try to set Bangla as default if available
      if (voices.some(v => v.lang.startsWith('bn-'))) {
        setSelectedLanguage('bn-IN');
      }
    };
    
    loadVoices();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Force load voices on Chrome (which sometimes doesn't load them initially)
    const timer = setTimeout(() => {
      if (window.speechSynthesis.getVoices().length === 0) {
        loadVoices();
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      stopSpeech(); // Clean up any ongoing speech
    };
  }, []);

  // Initialize notes from state or fetch from API
  useEffect(() => {
    let isMounted = true; // Prevent setting state if component unmounts
    
    const fetchNotes = async () => {
      // If we have notes in state, use them (this means data was already fetched in SelectSubject)
      if (state?.note && state.note.length > 0) {
        if (isMounted) {
          setNotes(state.note);
          setIsLoading(false);
        }
        return;
      }
      
      // If skipInitialLoading is true but no notes provided, something went wrong
      if (skipInitialLoading) {
        if (isMounted) {
          setError('Notes data not found. Please try again.');
          setIsLoading(false);
        }
        return;
      }
      
      // Set loading to true when starting to fetch
      if (isMounted) {
        setIsLoading(true);
        setError('');
      }
      
      // Fetch notes from API
      try {
        const className = state?.className || state?.class || 'Class 9';
        const subject = state?.subject || 'Science';
        const chapter = state?.chapter || '1';
        
        const mappedClassName = mapClassForExamAPI(className);
        const mappedSubject = mapSubjectForExamAPI(subject);
        
        const params = new URLSearchParams({
          className: mappedClassName,
          subject: mappedSubject,
          chapter
        });

        const apiUrl = `${LEARNING_API_BASE_URL}${API_ENDPOINTS.GENERATE_NOTE}?${params.toString()}`;
        
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (!isMounted) return; // Don't set state if component unmounted
          
          // Check for note array in the response (API sends under 'note' field)
          if (data.note && Array.isArray(data.note)) {
            if (isMounted) {
              setNotes(data.note);
              setIsLoading(false);
            }
          } else if (data.note && typeof data.note === 'string') {
            // Handle case where note might be a single string
            if (isMounted) {
              setNotes([data.note]);
              setIsLoading(false);
            }
          } else if (data.note && typeof data.note === 'object' && data.note !== null) {
            // Handle case where note might be an object that needs to be converted
            try {
              // Handle the specific format {"note ": " ............ " }
              if (data.note.hasOwnProperty('note ')) {
                const noteValue = data.note['note '];
                if (isMounted) {
                  setNotes([noteValue]);
                  setIsLoading(false);
                }
              } else {
                // Fallback to Object.values for other object formats
                const noteArray = Object.values(data.note);
                if (isMounted) {
                  setNotes(noteArray);
                  setIsLoading(false);
                }
              }
            } catch (error) {
              console.error('Error converting note object:', error);
              if (isMounted) {
                setError('Invalid notes format received from server.');
                setIsLoading(false);
              }
            }
          } else if (data.notes && Array.isArray(data.notes)) {
            if (isMounted) {
              setNotes(data.notes);
              setIsLoading(false);
            }
          } else if (data.lesson && Array.isArray(data.lesson)) {
            if (isMounted) {
              setNotes(data.lesson);
              setIsLoading(false);
            }
          } else if (data.content && Array.isArray(data.content)) {
            if (isMounted) {
              setNotes(data.content);
              setIsLoading(false);
            }
          } else {
            if (isMounted) {
              setError('No notes available for this chapter. Please try a different chapter or subject.');
              setIsLoading(false);
            }
          }
        } else {
          console.error('Failed to fetch notes, status:', response.status);
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          if (isMounted) {
            setError('Failed to fetch notes. Please try again.');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (isMounted) {
          setError('Unable to connect to server. Please check your connection and try again.');
          setIsLoading(false);
        }
      }
    };

    fetchNotes();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [state?.className, state?.subject, state?.chapter, state?.note]); // More specific dependencies

  // Extract class, subject, chapter from state if available
  const selectedClass = state?.class || state?.className || '';
  const selectedSubject = state?.subject || '';
  const selectedChapter = state?.chapter || '';
  const dynamicTitle = [selectedClass, selectedSubject, selectedChapter].filter(Boolean).join(' • ') || 'Your Generated Notes';

  // Check if Bangla voices are available
  const hasBanglaVoices = availableVoices.some(v => v.lang.startsWith('bn-'));
  
  // Enhanced speakNotes function with Bangla support
  const speakNotes = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    if (isSpeaking) return;

    if (availableVoices.length === 0) {
      alert('Voices not loaded yet, please try again.');
      return;
    }

    // Check if Bangla is selected but no Bangla voices available
    if (selectedLanguage.startsWith('bn-') && !hasBanglaVoices) {
      alert('Bangla voices not available on your system. Please install Bangla language pack or use English.');
      return;
    }

    const text = notes.join('\n\n');
    const utterance = new SpeechSynthesisUtterance(text);

    // Enhanced voice selection for Bangla
    let voice;
    
    // First try exact match for selected language
    voice = availableVoices.find(v => v.lang === selectedLanguage);
    
    // Then try language family match (e.g., any Bangla voice)
    if (!voice && selectedLanguage.startsWith('bn-')) {
      voice = availableVoices.find(v => v.lang.startsWith('bn-'));
    }
    
    // Then try default voice
    if (!voice) {
      voice = availableVoices.find(v => v.default) || availableVoices[0];
    }

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; // Use the voice's actual language
    } else {
      utterance.lang = selectedLanguage;
    }

    // Adjust rate for Bangla (often sounds better slightly slower)
    utterance.rate = selectedLanguage.startsWith('bn-') ? 0.85 : 0.9;
    utterance.pitch = 1;

    // Event handlers
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      console.error('SpeechSynthesis error details:', {
        error: event.error,
        message: event.message,
        elapsedTime: event.elapsedTime,
        charIndex: event.charIndex
      });
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
      
      // Show user-friendly error message
      if (event.error === 'not-allowed') {
        alert('Speech synthesis was blocked. Please allow audio permissions and try again.');
      } else if (event.error === 'network') {
        alert('Network error occurred during speech synthesis. Please try again.');
      } else {
        alert('Speech synthesis failed. Please try again or use a different browser.');
      }
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const pauseSpeech = () => {
    if (isSpeaking && !isPaused && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  // Main render
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin"></div>
          <p className="mt-6 text-lg font-semibold text-[#343434] dark:text-white">Loading Notes...</p>
        </div>
      )}
      
      {/* Header */}
      <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b shrink-0 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900">
        <img src={isDarkMode ? flowLogoDark : flowLogo} alt="FLOW Logo" className="h-10" />
        <button 
          className="px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-[#343434] hover:text-white dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={() => navigate('/main')}
          aria-label="Go back to main page"
        >
          <IoMdArrowRoundBack />
          Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl border p-0 md:p-0 mt-8 overflow-hidden bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          {/* Dynamic Title */}
          <div className="px-10 py-8 flex items-center gap-4 border-b bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-gray-100 dark:border-gray-700">
            <span className="text-4xl text-[#343434] dark:text-white"><GrNotes /></span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#343434] dark:text-white">{dynamicTitle}</h2>
          </div>
          
          {/* Controls Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-10 py-5 border-b bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600">
            <div className="flex gap-2">
              {notes.length > 0 ? (
                <PDFDownloadLink
                  document={<NotesPDF title={dynamicTitle} notes={notes} />}
                  fileName={`${dynamicTitle.replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, '_').replace(/\s+/g, '_')}_notes.pdf`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                          ? 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300' 
                          : 'bg-[#343434] hover:bg-gray-800 text-white border-gray-700'
                  }`}
                >
                  {({ loading }) => (
                    <>
                      <FaDownload />
                      {loading ? 'Generating PDF...' : 'Download PDF'}
                    </>
                  )}
                </PDFDownloadLink>
              ) : (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-not-allowed border bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-500"
                  disabled
                >
                  <FaDownload /> Download PDF
                </button>
              )}
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              {selectedLanguage.startsWith('bn-') && !hasBanglaVoices && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                  ⚠️ Bangla voices not available - install language pack or use English
                </div>
              )}
              
              {selectedLanguage.startsWith('bn-') && hasBanglaVoices && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                  ✅ Bangla TTS available
                </div>
              )}
              
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#343434] disabled:opacity-50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isSpeaking && !isPaused}
                aria-label="Select language for text-to-speech"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="bn-IN">Bangla (India)</option>
                <option value="bn-BD">Bangla (Bangladesh)</option>
              </select>
              
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                        ? 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300' 
                        : 'bg-[#343434] hover:bg-gray-800 text-white border-gray-700'
                }`}
                onClick={speakNotes}
                disabled={notes.length === 0 || (isSpeaking && !isPaused)}
                aria-label={isPaused ? 'Resume text-to-speech' : 'Start text-to-speech'}
              >
                <FaVolumeUp /> {isPaused ? 'Resume' : 'Read Aloud'}
              </button>
              
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium shadow-sm transition-all border disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-[#343434] dark:text-gray-200 border-gray-200 dark:border-gray-500"
                onClick={pauseSpeech}
                disabled={!isSpeaking || isPaused}
                aria-label="Pause text-to-speech"
              >
                <FaPause /> Pause
              </button>
              
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium shadow-sm transition-all border disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-[#343434] dark:text-gray-200 border-gray-200 dark:border-gray-500"
                onClick={stopSpeech}
                disabled={!isSpeaking}
                aria-label="Stop text-to-speech"
              >
                <FaStop /> Stop
              </button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="px-10 py-6">
              <div className="bg-gradient-to-r border rounded-xl shadow-sm p-6 from-red-50 to-pink-50 dark:from-red-900/50 dark:to-pink-900/50 border-red-200 dark:border-red-700">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-red-800 dark:text-red-200">Unable to Load Notes</h3>
                    <p className="text-red-600 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Content */}
          <div className="px-10 py-10 min-h-[400px]">
            {!state ? (
              // No state at all
              <div className="flex flex-col items-center justify-center py-16">
                <span className="text-6xl mb-4">📄</span>
                <p className="text-lg font-medium text-gray-400 dark:text-gray-300">
                  No notes data found. Please generate notes first.
                </p>
              </div>
            ) : isLoading ? (
              // Loading state - show loading spinner or message
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium text-gray-400 dark:text-gray-300">
                  Loading your notes...
                </p>
              </div>
            ) : notes.length === 0 ? (
              // No notes after loading completed
              <div className="flex flex-col items-center justify-center py-16">
                <span className="text-6xl mb-4">📄</span>
                <p className="text-lg font-medium text-gray-400 dark:text-gray-300">
                  No notes available for this selection.
                </p>
              </div>
            ) : (
              // Show notes
              <ul className="space-y-8">
                {notes.map((note, index) => (
                  <li 
                    key={index} 
                    className="rounded-xl shadow border hover:shadow-lg transition-all p-8 text-lg leading-relaxed bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-[#343434] dark:text-gray-200"
                  >
                    <TextDisplay content={note} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShowNotes;