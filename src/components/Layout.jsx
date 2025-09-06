import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
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
            sidebarOpen ? "ml-64" : ""
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

        {/* Mobile Toggle Button - Only show on mobile when sidebar is closed */}
        {isMobile && !sidebarOpen && (
          <motion.button
            onClick={handleSidebarToggle}
            className="fixed top-6 left-6 z-50 w-12 h-12 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            whileHover={{
              scale: 1.05,
              y: -2,
              transition: { type: "spring", stiffness: 400, damping: 25 },
            }}
            whileTap={{
              scale: 0.95,
              transition: { type: "spring", stiffness: 400, damping: 25 },
            }}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
          >
            <Menu className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors duration-200" />
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none"
            >
              Open Sidebar
            </motion.div>
          </motion.button>
        )}

      </div>
    </div>
  );
};

export default Layout;
