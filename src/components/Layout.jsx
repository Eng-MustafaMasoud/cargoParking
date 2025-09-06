import { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // On desktop, start with sidebar open
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-hero-pattern opacity-5 pointer-events-none"></div>

      {/* Floating Elements */}
      <div className="fixed top-20 right-20 w-32 h-32 bg-primary-200/20 rounded-full animate-float pointer-events-none"></div>
      <div
        className="fixed bottom-20 left-20 w-24 h-24 bg-accent-200/20 rounded-full animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="fixed top-1/2 right-1/4 w-16 h-16 bg-success-200/20 rounded-full animate-float pointer-events-none"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
        />

        {/* Main content area */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            !isMobile && sidebarOpen ? "ml-64" : ""
          }`}
        >
          {/* Header */}
          <Header onSidebarToggle={handleSidebarToggle} />

          {/* Page content */}
          <main className="flex-1 relative z-10">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in-up">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
