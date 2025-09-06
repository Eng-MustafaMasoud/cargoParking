import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();

  // Define route mappings
  const routeMap = {
    "/": "Dashboard",
    "/gate": "Gate Management",
    "/checkpoint": "Checkpoint",
    "/admin": "Admin Dashboard",
    "/admin/reports": "Reports",
    "/admin/settings": "Settings",
    "/admin/users": "User Management",
    "/admin/zones": "Zone Management",
    "/admin/categories": "Category Management",
    "/admin/subscriptions": "Subscriptions",
  };

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment);
    const breadcrumbs = [{ label: "Home", path: "/" }];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label =
        routeMap[currentPath] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <nav
      className="flex items-center space-x-1 text-sm text-gray-600 mb-6"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index === 0 ? (
            <Link
              to={breadcrumb.path}
              className="flex items-center hover:text-primary-600 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-1" />
              <span className="font-medium">{breadcrumb.label}</span>
            </Link>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              {breadcrumb.isLast ? (
                <span className="font-medium text-gray-900">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  to={breadcrumb.path}
                  className="hover:text-primary-600 transition-colors duration-200"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
