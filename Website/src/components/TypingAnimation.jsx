import React, { useState, useEffect } from 'react';

export const TypingAnimation = ({ text, speed = 20, isComplete, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isComplete && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentIndex >= text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  useEffect(() => {
    if (!isComplete) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
    }
  }, [isComplete, text]);

  return <span>{displayedText}</span>;
};

export const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};
