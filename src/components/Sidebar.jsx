import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Car,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  Building2,
  MapPin,
  Clock,
  Shield,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle, isMobile = false }) => {
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location.pathname === "/",
    },
    {
      name: "Gate Screen",
      href: "/gate-screen",
      icon: Car,
      current: location.pathname === "/gate-screen",
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      current: location.pathname.startsWith("/reports"),
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      current: location.pathname.startsWith("/users"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location.pathname.startsWith("/settings"),
    },
  ];

  const adminNavigation = [
    {
      name: "Admin Dashboard",
      href: "/admin",
      icon: Shield,
      current: location.pathname === "/admin",
    },
    {
      name: "Gates Management",
      href: "/admin/gates",
      icon: Building2,
      current: location.pathname === "/admin/gates",
    },
    {
      name: "Zones Management",
      href: "/admin/zones",
      icon: MapPin,
      current: location.pathname === "/admin/zones",
    },
    {
      name: "Categories Management",
      href: "/admin/categories",
      icon: Settings,
      current: location.pathname === "/admin/categories",
    },
  ];

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const backdropVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const headerVariants = {
    open: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1,
      },
    },
    closed: {
      scale: 0.95,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Ultra-Modern Sidebar Toggle Button */}
      {!isMobile && (
        <motion.button
          onClick={onToggle}
          className="fixed top-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-white via-gray-50 to-gray-100 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center group overflow-hidden"
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
            delay: 0.4,
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

          {/* Icon Container */}
          <motion.div
            className="relative z-10"
            animate={{
              scale: isOpen ? 1 : 1.1,
              rotate: isOpen ? 0 : 5,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
              >
                <X className="w-7 h-7" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
              >
                <Menu className="w-7 h-7" />
              </motion.div>
            )}
          </motion.div>

          {/* Modern Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 15, y: 0 }}
            whileHover={{ opacity: 1, x: 0, y: 0 }}
            className="absolute left-full ml-4 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl whitespace-nowrap pointer-events-none shadow-xl border border-white/10"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>{isOpen ? "Close Sidebar" : "Open Sidebar"}</span>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-r-8 border-r-gray-900/95 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
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

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <motion.div
            variants={headerVariants}
            className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg"
          >
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div
                className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl shadow-glow"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </motion.div>
              <div className="text-white">
                <h1 className="text-lg font-bold">Dallas Cargo</h1>
                <p className="text-xs text-primary-100 font-medium">
                  Parking Management
                </p>
              </div>
            </motion.div>
            {isMobile && (
              <motion.button
                onClick={onToggle}
                className="text-white hover:text-primary-200 hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              </motion.button>
            )}
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <motion.div className="space-y-1">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.name}
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.02,
                      x: 4,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        item.current
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                      }`}
                    >
                      <motion.div
                        className="mr-3 h-5 w-5 flex-shrink-0"
                        whileHover={{ rotate: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors duration-200 ${
                            item.current
                              ? "text-white"
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        />
                      </motion.div>
                      <span className="flex-1">{item.name}</span>
                      <AnimatePresence>
                        {item.current && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                          >
                            <ChevronRight className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Admin Section */}
            <motion.div
              className="pt-6 mt-6 border-t border-gray-200/50"
              variants={itemVariants}
            >
              <motion.p
                className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Administration
              </motion.p>
              <div className="space-y-1">
                {adminNavigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.02,
                        x: 4,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        },
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.href}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          item.current
                            ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                        }`}
                      >
                        <motion.div
                          className="mr-3 h-5 w-5 flex-shrink-0"
                          whileHover={{ rotate: 5 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          <Icon
                            className={`h-5 w-5 transition-colors duration-200 ${
                              item.current
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                        </motion.div>
                        <span className="flex-1">{item.name}</span>
                        <AnimatePresence>
                          {item.current && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              }}
                            >
                              <ChevronRight className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </nav>

          {/* Footer */}
          <motion.div
            className="px-4 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-transparent"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div
                className="flex-shrink-0"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Dallas Cargo
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Parking Management
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
