import React, { useState, useEffect } from "react";

const TypingText = ({ text, typingSpeed = 5, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typingSpeed, onComplete]);

  return <span>{displayedText}</span>;
};

export default TypingText;
