import React, { useState, useEffect } from 'react';
import TextDisplay from './TextDisplay';

const TypewriterEffect = ({ 
  text, 
  speed = 30, 
  delay = 500,
  onComplete = null,
  className = '',
  showCursor = true,
  useTextDisplay = false,
  isUserMessage = false,
  fontSize = 16
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setCurrentIndex(0);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setCurrentIndex(0);
    setDisplayText('');

    // Initial delay before starting to type
    const startTimer = setTimeout(() => {
      const typeInterval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          if (prevIndex >= text.length) {
            clearInterval(typeInterval);
            setIsTyping(false);
            if (onComplete) onComplete();
            return prevIndex;
          }
          setDisplayText(text.slice(0, prevIndex + 1));
          return prevIndex + 1;
        });
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => {
      clearTimeout(startTimer);
    };
  }, [text, speed, delay, onComplete]);

  // If using TextDisplay, apply typewriter effect to the text first, then render with markdown
  if (useTextDisplay) {
    return (
      <div className={className}>
        <TextDisplay content={displayText} isUserMessage={isUserMessage} fontSize={fontSize} />
        {showCursor && isTyping && (
          <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-1"></span>
        )}
      </div>
    );
  }

  // Regular typewriter effect for plain text
  return (
    <div className={className}>
      {displayText}
      {showCursor && isTyping && (
        <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-1"></span>
      )}
    </div>
  );
};

export default TypewriterEffect;
