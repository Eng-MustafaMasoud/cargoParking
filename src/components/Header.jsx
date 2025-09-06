import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Home,
  Building2,
} from "lucide-react";

const Header = ({ onSidebarToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Home", href: "/", icon: Home }];

    if (pathSegments.length === 0) {
      return breadcrumbs;
    }

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      let name = segment.charAt(0).toUpperCase() + segment.slice(1);
      let icon = Building2;

      // Customize breadcrumb names and icons
      switch (segment) {
        case "admin":
          name = "Administration";
          icon = Building2;
          break;
        case "gates":
          name = "Gate Management";
          icon = Building2;
          break;
        case "zones":
          name = "Zone Management";
          icon = Building2;
          break;
        case "reports":
          name = "Reports";
          icon = Building2;
          break;
        case "users":
          name = "User Management";
          icon = Building2;
          break;
        case "settings":
          name = "Settings";
          icon = Building2;
          break;
        default:
          name = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      breadcrumbs.push({
        name,
        href: currentPath,
        icon,
        current: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu button and breadcrumbs */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle */}
          <button
            onClick={onSidebarToggle}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-1 text-sm">
            {breadcrumbs.map((breadcrumb, index) => {
              const Icon = breadcrumb.icon;
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div key={breadcrumb.href} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                  <div className="flex items-center space-x-1">
                    <Icon className="w-4 h-4 text-gray-500" />
                    {isLast ? (
                      <span className="font-semibold text-gray-900">
                        {breadcrumb.name}
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(breadcrumb.href)}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium hover:bg-gray-100 px-2 py-1 rounded-md"
                      >
                        {breadcrumb.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative group">
            <Bell className="w-5 h-5 group-hover:animate-wiggle" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "Employee"}
                </p>
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 py-1 z-50 animate-fade-in-up">
                <div className="px-4 py-2 border-b border-gray-200/50">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.username || "username"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
