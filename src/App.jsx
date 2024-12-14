import React, { useState, useEffect } from "react";
import { CgSidebar } from "react-icons/cg";
import DarkModeToggle from './components/ui/DarkModeToggle';
import ChatInterface from "./components/ChatInterface";
import Sidebar from "./components/Sidebar";
import Tooltip from './components/ui/Tooltip';
import ProfileDropdown from "./components/ui/ProfileDropdown";

// Main App Component
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen width and set mobile state
    const checkMobileView = () => {
      setIsMobile(window.innerWidth < 767);
      
      // If mobile, close sidebar by default
      if (window.innerWidth < 767) {
        setIsSidebarOpen(false);
      } else {
        // For desktop, open sidebar by default
        setIsSidebarOpen(false);
      }
    };

    // Check initial width
    checkMobileView();

    // Add resize listener
    window.addEventListener('resize', checkMobileView);

    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="bg-stone-50 dark:bg-neutral-800 font-inter flex-1 flex flex-col h-screen scrollbar-thin scrollbar-thumb-zinc-600 dark:scrollbar-thumb-neutral-600">
        {/* Header */}
        <header className="top-0 border-y dark:border-dark-700 p-1.5 flex justify-between items-center">
          <Tooltip content="Open Sidebar" placement="right">
            <button
              onClick={toggleSidebar}
              className="text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-neutral-700 dark:focus:ring-dark-600 p-0.5 hover:bg-zinc-200 focus:outline-none rounded-md transition-display duration-400"
            >
              {!isSidebarOpen && (
                <CgSidebar size={24} />
              )}
            </button>
          </Tooltip>
          <div className="ml-12 lg:ml-8">
            <h1 className="text-xl font-jost font-semibold text-gray-800 dark:text-gray-100">
              AMA.ai
            </h1>
          </div>
          <div className="flex p-0 items-center">
            <div className="rounded-full">
              <ProfileDropdown />              
            </div>
            <div className="ml-2 rounded-full">
              <button>
                <DarkModeToggle />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <ChatInterface />
      </div>
    </div>
  );
};

export default App;