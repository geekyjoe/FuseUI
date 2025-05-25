import React, { useState, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { CgSidebar } from "react-icons/cg";
import DarkModeToggle from "./components/ui/DarkModeToggle";
import ChatInterface from "./components/ChatInterface";
import Sidebar from "./components/Sidebar";
import Tooltip from "./components/ui/Tooltip";
import ProfileDropdown from "./components/ui/ProfileDropdown";
import { AuthProvider, useAuth } from "./api/AuthContext";
import LoginModal from "./form/Login";
import User from "./pages/UP";
import "./App.css";

const Content = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Child />} />
        <Route path="/profile" element={<User />} />
      </Routes>
    </>
  );
};

// Main App Component wrapper with AuthProvider
const AppWrapper = () => {
  return (
    <AuthProvider>
      <Router>
        <Content />
      </Router>
    </AuthProvider>
  );
};

// Main App Component
const Child = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();

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
    window.addEventListener("resize", checkMobileView);

    // Cleanup listener
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    document.title = "AMA.ai"; // Set the document title
  }, []);

  // Show login modal if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated]);

  // Add loading state UI
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50 dark:bg-neutral-800">
        <div
          aria-label="Orange and tan hamster running in a metal wheel"
          role="img"
          className="wheel-and-hamster"
        >
          <div className="wheel"></div>
          <div className="hamster">
            <div className="hamster__body">
              <div className="hamster__head">
                <div className="hamster__ear"></div>
                <div className="hamster__eye"></div>
                <div className="hamster__nose"></div>
              </div>
              <div className="hamster__limb hamster__limb--fr"></div>
              <div className="hamster__limb hamster__limb--fl"></div>
              <div className="hamster__limb hamster__limb--br"></div>
              <div className="hamster__limb hamster__limb--bl"></div>
              <div className="hamster__tail"></div>
            </div>
          </div>
          <div className="spoke"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="bg-stone-50 duration-300 dark:bg-neutral-800 font-inter flex-1 flex flex-col h-screen scrollbar-thin scrollbar-thumb-zinc-600 dark:scrollbar-thumb-neutral-600">
        {/* Header */}
        <header className="top-0 m-0 dark:border-dark-700 p-1.5 flex justify-between items-center">
          <Tooltip content="Open Sidebar" placement="right">
            <button
              onClick={toggleSidebar}
              className={`text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-neutral-700 dark:focus:ring-dark-600 p-0.5 hover:bg-zinc-200 focus:outline-hidden rounded-md transition-display duration-400 ${
                isAuthenticated ? "visible" : "invisible"
              }`}
            >
              {!isSidebarOpen && <CgSidebar size={24} />}
            </button>
          </Tooltip>
          <div className="ml-10 lg:ml-7">
            <h1 className="text-xl font-jost font-semibold text-gray-800 dark:text-gray-300">
              AMA.ai
            </h1>
          </div>
          <div className="flex p-0.5 items-center">
            <div className="flex rounded-full">
              {isAuthenticated ? (
                <>
                  <ProfileDropdown user={user} />
                  <DarkModeToggle />
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-neutral-700 dark:focus:ring-dark-600 p-2 hover:bg-zinc-200 focus:outline-hidden rounded-md transition-display duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        {isAuthenticated ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Please sign in to continue
            </p>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default AppWrapper;
