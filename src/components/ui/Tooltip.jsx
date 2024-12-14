import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Default styles
import 'tippy.js/animations/shift-away-subtle.css'; // Optional animations
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/translucent.css'; // Add dark mode theme

const Tooltip = ({
  content,
  children,
  placement = 'top',
  animation = 'shift-away-subtle',
  delay = [10, 50],
  interactive = true,
  arrow = true,
  className = '',
  contentClassName = '',
  maxWidth = '250px',
  offset = [0, 10], // Added offset with default value
  ...props
}) => {
  // Track dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Track screen width
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const root = window.document.documentElement;
    const darkModeEnabled = root.classList.contains('dark');
    setIsDarkMode(darkModeEnabled);

    const darkModeObserver = new MutationObserver(() => {
      setIsDarkMode(root.classList.contains('dark'));
    });

    darkModeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });

    // Handle screen width
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      darkModeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Only show tooltip if screen width is 472px or larger
  if (screenWidth < 768) {
    return children;
  }

  return (
    <Tippy
      content={content}
      placement={placement}
      animation={animation}
      delay={delay}
      theme={isDarkMode ? 'translucent' : 'light-border'} // Switch theme
      interactive={interactive}
      arrow={arrow}
      maxWidth={maxWidth}
      offset={offset} // Added offset prop
      className={'p-0.5 rounded-md font-jost'}
      {...props}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;