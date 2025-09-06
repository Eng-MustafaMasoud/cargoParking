import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle }) => {
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

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 flex-shrink-0 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen
            ? "translate-x-0 fixed inset-y-0 left-0 z-50"
            : "-translate-x-full fixed inset-y-0 left-0 z-50 lg:translate-x-0 lg:static"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl shadow-glow">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-lg font-bold">Dallas Cargo</h1>
                <p className="text-xs text-primary-100 font-medium">
                  Parking Management
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-white hover:text-primary-200 hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      item.current
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        item.current
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.current && (
                      <ChevronRight className="h-4 w-4 text-white" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin Section */}
            <div className="pt-6 mt-6 border-t border-gray-200/50">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Administration
              </p>
              <div className="space-y-1">
                {adminNavigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        item.current
                          ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                      }`}
                      style={{
                        animationDelay: `${
                          (navigation.length + index) * 0.05
                        }s`,
                      }}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                          item.current
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.current && (
                        <ChevronRight className="h-4 w-4 text-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Dallas Cargo
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Parking Management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
