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

        {/* Ultra-Modern Mobile Toggle Button */}
        {isMobile && !sidebarOpen && (
          <motion.button
            onClick={handleSidebarToggle}
            className="fixed top-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-white via-gray-50 to-gray-100 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center group overflow-hidden"
            whileHover={{
              scale: 1.08,
              y: -3,
              rotate: 2,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            whileTap={{
              scale: 0.92,
              transition: { type: "spring", stiffness: 400, damping: 25 },
            }}
            initial={{ opacity: 0, scale: 0.5, y: -30, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
          >
            {/* Animated Background Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
            
            {/* Pulsing Ring Effect */}
            <motion.div
              className="absolute inset-0 border-2 border-blue-400/30 rounded-2xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />

            {/* Icon */}
            <motion.div
              className="relative z-10"
              animate={{
                scale: 1.1,
                rotate: 5,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Menu className="w-7 h-7 text-gray-700 group-hover:text-gray-900 transition-colors duration-300" />
            </motion.div>

            {/* Modern Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: -15, y: 0 }}
              whileHover={{ opacity: 1, x: 0, y: 0 }}
              className="absolute right-full mr-4 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl whitespace-nowrap pointer-events-none shadow-xl border border-white/10"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Open Sidebar</span>
              </div>
              {/* Tooltip Arrow */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-900/95 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </motion.div>

            {/* Floating Particles Effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 4,
              }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400 rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${30 + i * 20}%`,
                  }}
                  animate={{
                    y: [-10, -20, -10],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                />
              ))}
            </motion.div>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Layout;
