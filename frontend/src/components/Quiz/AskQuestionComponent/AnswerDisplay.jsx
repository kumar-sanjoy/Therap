// Polyfill for @react-pdf/renderer compatibility
if (typeof global === 'undefined') {
  window.global = window;
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import teacherImage from '../../../assets/teacher.jpg';
import TypewriterEffect from '../../Common/TypewriterEffect';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import QuestionAnswerPDF from './QuestionAnswerPDF';
import { FaDownload } from 'react-icons/fa';

const AnswerDisplay = React.memo(({ showAnswer, question, answer, onTextSelect }) => {
    const { isDarkMode } = useDarkTheme();
    const [selectedText, setSelectedText] = useState('');
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptPosition, setPromptPosition] = useState({ x: 0, y: 0 });
    const answerRef = useRef(null);

    // Memoize the PDF document to prevent unnecessary re-renders
    const pdfDocument = useMemo(() => (
        <QuestionAnswerPDF 
            question={question} 
            answer={answer}
            Document={Document}
            Page={Page}
            Text={Text}
            View={View}
            StyleSheet={StyleSheet}
            Font={Font}
        />
    ), [question, answer]);

    // Memoize the filename to prevent unnecessary re-renders
    const pdfFileName = useMemo(() => 
        `question_answer_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`,
        []
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Hide prompt when clicking outside the answer area
            if (answerRef.current && !answerRef.current.contains(event.target)) {
                setShowPrompt(false);
                setSelectedText('');
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setShowPrompt(false);
                setSelectedText('');
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('keydown', handleEscapeKey);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    const handleTextSelection = () => {
        // Small delay to ensure selection is complete
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            
            if (text.length > 0 && answerRef.current && answerRef.current.contains(selection.anchorNode)) {
                setSelectedText(text);
                
                // Get selection coordinates with better positioning
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                setPromptPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 15
                });
                setShowPrompt(true);
            } else {
                setShowPrompt(false);
                setSelectedText('');
            }
        }, 10);
    };

    const handleSelectionChange = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        // Check if selection is empty or not within our component
        if (text.length === 0 || 
            !selection.anchorNode || 
            (answerRef.current && !answerRef.current.contains(selection.anchorNode))) {
            setShowPrompt(false);
            setSelectedText('');
        }
    };

    const handleAskFlow = () => {
        if (selectedText && onTextSelect) {
            onTextSelect(selectedText);
            setShowPrompt(false);
            setSelectedText('');
            // Clear selection
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
        }
    };

    // Early return after all hooks to avoid hook rendering issues
    if (!showAnswer) return null;

    const handleDownload = () => {
        // Always save as .txt file
        const content = answer;
        const contentType = 'text/plain';
        const filename = `answer_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;

        const element = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        // Clean up the URL object
        URL.revokeObjectURL(element.href);
    };



    return (
        <div className="mx-auto max-w-4xl px-4 mb-8" ref={answerRef}>
            <div className="flex items-start gap-3">
                {/* Teacher Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-500">
                    <img 
                        src={teacherImage} 
                        alt="AI Teacher" 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Answer Message */}
                <div className="flex-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 border border-indigo-200 dark:border-indigo-700 rounded-2xl p-4 relative">
                    {/* Teacher name */}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                            Answer to your question
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownload}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                }`}
                                title="Download answer as text file"
                            >
                                <FaDownload className="w-4 h-4" />
                                TXT
                            </button>
                            <PDFDownloadLink
                                key={`pdf-${question}-${answer}`}
                                document={pdfDocument}
                                fileName={pdfFileName}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isDarkMode 
                                        ? 'bg-red-700 hover:bg-red-600 text-gray-200 border border-red-600' 
                                        : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
                                }`}
                            >
                                {({ loading }) => (
                                    <>
                                        <FaDownload className="w-4 h-4" />
                                        {loading ? 'Generating PDF...' : 'PDF'}
                                    </>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </div>
                    
                    <div 
                        className="max-w-full overflow-hidden select-text cursor-text"
                        onMouseUp={handleTextSelection}
                        onTouchEnd={handleTextSelection}
                    >
                        <TypewriterEffect 
                            text={answer}
                            speed={20}
                            delay={500}
                            className="leading-relaxed"
                            useTextDisplay={true}
                            isUserMessage={false}
                        />
                    </div>
                </div>
            </div>
            
            {/* Enhanced Floating Ask Flow Button */}
            {showPrompt && selectedText && (
                <div 
                    className="fixed z-[9999] transform -translate-x-1/2 -translate-y-full pointer-events-none"
                    style={{ 
                        left: promptPosition.x, 
                        top: promptPosition.y 
                    }}
                >
                    <div className="pointer-events-auto animate-[fadeInUp_0.2s_ease-out]">
                        <button
                            onClick={handleAskFlow}
                            className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                isDarkMode 
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-2 border-indigo-400/30 hover:border-indigo-300/50' 
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-2 border-white/20 hover:border-white/40'
                            } backdrop-blur-sm`}
                            title={`Ask about: "${selectedText.length > 30 ? selectedText.substring(0, 30) + '...' : selectedText}"`}
                        >
                            {/* Animated background glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
                            
                            {/* Icon with rotation animation on hover */}
                            <svg 
                                className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2.5} 
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                                />
                            </svg>
                            
                            <span className="relative z-10">Ask Flow</span>
                            
                            {/* Pulse effect */}
                            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-30"></div>
                        </button>
                        
                        {/* Small arrow pointing down */}
                        <div className={`absolute left-1/2 transform -translate-x-1/2 top-full ${
                            isDarkMode ? 'text-indigo-600' : 'text-indigo-500'
                        }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
                                <path d="M6 0L12 6H0z" transform="rotate(180 6 6)" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.showAnswer === nextProps.showAnswer &&
        prevProps.question === nextProps.question &&
        prevProps.answer === nextProps.answer &&
        prevProps.onTextSelect === nextProps.onTextSelect
    );
});

export default AnswerDisplay;
