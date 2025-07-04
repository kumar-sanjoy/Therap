import React, { useState, useEffect, useRef } from 'react';
import TextDisplay from "./TextDisplay";
import { useLocation, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { PDFDownloadLink } from '@react-pdf/renderer';
import '../css/ShowNotes.css';
import flowLogo from '../assets/flow-main-nobg.png';
import { DEV_MODE } from '../config';
import { FaDownload, FaVolumeUp, FaPause, FaStop } from 'react-icons/fa';
import { GrNotes } from "react-icons/gr";
import NotesPDF from './NotesPDF';

const ShowNotes = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const skipInitialLoading = state?.skipInitialLoading;
  const [isLoading, setIsLoading] = useState(!skipInitialLoading);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [availableVoices, setAvailableVoices] = useState([]);
  const utteranceRef = useRef(null);

  // Simulate loading for initial render
  useEffect(() => {
    if (!skipInitialLoading) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [skipInitialLoading]);

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

  let notes = state?.note || [];
  if (
    DEV_MODE && (
      !notes.length ||
      (notes.length === 1 && notes[0].toLowerCase().includes('notes not available'))
    )
  ) {
    notes = [
      "**Chapter 1: Motion**\n\n- Motion is the change in position of an object with respect to time.\n- Distance is the total path length covered by an object.\n- Displacement is the shortest distance between initial and final positions.\n- Speed is the rate of change of distance.\n- Velocity is the rate of change of displacement.",
      "**গতি সম্পর্কে:**\n\n- গতি হল সময়ের সাপেক্ষে বস্তুর অবস্থানের পরিবর্তন।\n- দূরত্ব হল বস্তু দ্বারা অতিক্রান্ত মোট পথের দৈর্ঘ্য।\n- সরণ হল প্রাথমিক এবং চূড়ান্ত অবস্থানের মধ্যে সবচেয়ে ছোট দূরত্ব।\n- বেগ হল দূরত্বের পরিবর্তনের হার।\n- বেগ হল সরণের পরিবর্তনের হার।",
      "**Key Formulas:**\n\n- Average Speed = Total Distance / Total Time\n- Average Velocity = Total Displacement / Total Time\n- Acceleration = Change in Velocity / Time",
      "**সূত্রসমূহ:**\n\n- গড় বেগ = মোট দূরত্ব / মোট সময়\n- গড় বেগ = মোট সরণ / মোট সময়\n- ত্বরণ = বেগের পরিবর্তন / সময়",
      "**Types of Motion:**\n\n1. Uniform Motion: Constant speed\n2. Non-uniform Motion: Variable speed\n3. Circular Motion: Motion along a circular path\n4. Oscillatory Motion: To and fro motion",
      "**গতির প্রকারভেদ:**\n\n১. সমবেগ গতি: ধ্রুব বেগ\n২. অসমবেগ গতি: পরিবর্তনশীল বেগ\n৩. বৃত্তীয় গতি: বৃত্তাকার পথে গতি\n৪. দোলন গতি: এদিক-ওদিক গতি"
    ];
  }

  // Extract class, subject, chapter from state if available
  const selectedClass = state?.selectedClass || '';
  const selectedSubject = state?.selectedSubject || '';
  const selectedChapter = state?.selectedChapter || '';
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
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-200 flex flex-col">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#343434] rounded-full animate-spin"></div>
          <p className="mt-6 text-[#343434] text-lg font-semibold">Loading Notes...</p>
        </div>
      )}
      
      {/* Header */}
      <header className="w-full mx-auto flex items-center justify-between p-4 md:p-6 border-b border-gray-100 shrink-0 bg-gradient-to-r from-white to-gray-50/50">
        <img src={flowLogo} alt="FLOW Logo" className="h-10" />
        <button 
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-[#343434] hover:text-white transition-all flex items-center gap-2"
          onClick={() => navigate('/main')}
          aria-label="Go back to main page"
        >
          <IoMdArrowRoundBack />
          Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-0 md:p-0 mt-8 overflow-hidden">
          {/* Dynamic Title */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-10 py-8 flex items-center gap-4 border-b border-gray-100">
            <span className="text-4xl text-[#343434]"><GrNotes /></span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#343434] tracking-tight">{dynamicTitle}</h2>
          </div>
          
          {/* Controls Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-10 py-5 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-2">
              {notes.length > 0 ? (
                <PDFDownloadLink
                  document={<NotesPDF title={dynamicTitle} notes={notes} />}
                  fileName={`${dynamicTitle.replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, '_').replace(/\s+/g, '_')}_notes.pdf`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#343434] hover:bg-gray-800 text-white rounded-lg font-medium shadow-sm transition-all border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed border border-gray-300"
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
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#343434] disabled:opacity-50"
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
                className="flex items-center gap-2 px-4 py-2 bg-[#343434] hover:bg-gray-800 text-white rounded-lg font-medium shadow-sm transition-all border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={speakNotes}
                disabled={notes.length === 0 || (isSpeaking && !isPaused)}
                aria-label={isPaused ? 'Resume text-to-speech' : 'Start text-to-speech'}
              >
                <FaVolumeUp /> {isPaused ? 'Resume' : 'Read Aloud'}
              </button>
              
              <button
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#343434] rounded-lg font-medium shadow-sm transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={pauseSpeech}
                disabled={!isSpeaking || isPaused}
                aria-label="Pause text-to-speech"
              >
                <FaPause /> Pause
              </button>
              
              <button
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#343434] rounded-lg font-medium shadow-sm transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={stopSpeech}
                disabled={!isSpeaking}
                aria-label="Stop text-to-speech"
              >
                <FaStop /> Stop
              </button>
            </div>
          </div>
          
          {/* Notes Content */}
          <div className="px-10 py-10 min-h-[400px]">
            {!state || notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="text-6xl mb-4">📄</span>
                <p className="text-lg text-gray-400 font-medium">
                  {!state ? 'No notes data found. Please generate notes first.' : 'No notes available for this selection.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-8">
                {notes.map((note, index) => (
                  <li 
                    key={index} 
                    className="bg-white rounded-xl shadow border border-gray-100 hover:shadow-lg transition-all p-8 text-[#343434] text-lg leading-relaxed"
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