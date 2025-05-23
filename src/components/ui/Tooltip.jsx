import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away-subtle.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/translucent.css';

const Tooltip = ({
  content,
  children,
  placement = 'top',
  animation = 'shift-away-subtle',
  delay = [100, 50],
  interactive = false,
  arrow = true,
  className = '',
  contentClassName = 'p-0.5 font-jost text-neutral-500 dark:text-neutral-200',
  maxWidth = '250px',
  offset = [0, 10],
  theme = '',
  ...props
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const updateDarkMode = () => {
      setIsDarkMode(root.classList.contains('dark'));
    };

    updateDarkMode();

    const darkModeObserver = new MutationObserver(updateDarkMode);
    darkModeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => darkModeObserver.disconnect();
  }, []);

  const tooltipTheme = theme || (isDarkMode ? 'translucent' : 'light-border');

  return (
    <Tippy
      content={<span className={`text-sm ${contentClassName}`}>{content}</span>}
      placement={placement}
      animation={animation}
      delay={delay}
      interactive={interactive}
      arrow={arrow}
      maxWidth={maxWidth}
      offset={offset}
      theme={tooltipTheme}
      className={className}
      {...props}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;