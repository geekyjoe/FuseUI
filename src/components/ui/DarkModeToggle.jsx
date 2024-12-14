import React, { useState, useEffect } from 'react';
import { MoonStar, Sun } from 'lucide-react';
import Tooltip from './Tooltip';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to root element
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
  <Tooltip content="Toggle Theme" placement="bottom">
    <button
      onClick={toggleDarkMode}
      className="p-1 md:p-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 
        text-zinc-800 dark:text-gray-200 
        hover:bg-zinc-300 dark:hover:bg-zinc-600 
        focus:outline-none focus:ring-1 
        focus:ring-offset-2 
        focus:ring-gray-500 dark:focus:ring-gray-300"
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun size={24} />
      ) : (
        <MoonStar size={24} />
      )}
    </button>
  </Tooltip>
  );
};

export default DarkModeToggle;