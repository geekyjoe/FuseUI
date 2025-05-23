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
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const metaMsTileColor = document.querySelector('meta[name="msapplication-TileColor"]');
    const metaOperaColorScheme = document.querySelector('meta[name="color-scheme"]'); // Opera support

    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#18181b'); // Dark mode color
      if (metaMsTileColor) metaMsTileColor.setAttribute('content', '#18181b'); // Windows tile
      if (metaOperaColorScheme) metaOperaColorScheme.setAttribute('content', 'dark'); // Opera color scheme
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#fafaf9'); // Light mode color
      if (metaMsTileColor) metaMsTileColor.setAttribute('content', '#fafaf9'); // Windows tile
      if (metaOperaColorScheme) metaOperaColorScheme.setAttribute('content', 'light'); // Opera color scheme
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Tooltip content="Toggle Theme" placement="bottom">
      <button
        onClick={toggleDarkMode}
        className="ml-2 p-1 sm:p-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 
          text-zinc-800 dark:text-gray-200 
          hover:bg-zinc-300 dark:hover:bg-zinc-600 
          focus:outline-hidden focus:ring-1 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-300"
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
