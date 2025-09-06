import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import QueryProvider from "./providers/QueryProvider.jsx";
import Layout from "./components/Layout.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import PerformanceMonitor from "./components/PerformanceMonitor.jsx";
import GateScreen from "./pages/GateScreen.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import GatesManagement from "./pages/GatesManagement.jsx";
import ZonesManagement from "./pages/ZonesManagement.jsx";
import CategoriesManagement from "./pages/CategoriesManagement.jsx";
import Reports from "./pages/Reports.jsx";
import Users from "./pages/Users.jsx";
import Settings from "./pages/Settings.jsx";

// Lazy load additional components
const WebSocketStatus = lazy(() =>
  import(/* webpackChunkName: "websocket" */ "./components/WebSocketStatus.jsx")
);

// Lazy load page components with chunk names for better code splitting
const Login = lazy(() => import("./pages/Login.jsx"));

const NotFound = lazy(() =>
  import(/* webpackChunkName: "error" */ "./pages/NotFound.jsx")
);
const UnAuthorized = lazy(() =>
  import(/* webpackChunkName: "error" */ "./pages/UnAuthorized.jsx")
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  // Debug logging
  console.log(
    "ProtectedRoute - user:",
    user,
    "isLoading:",
    isLoading,
    "requiredRole:",
    requiredRole
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log("ProtectedRoute - Role mismatch, redirecting to home");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ErrorBoundary
      showDetails={import.meta.env.DEV}
      onError={(error, errorInfo) => {
        // Custom error handling
        console.error("App Error:", error, errorInfo);
      }}
    >
      <QueryProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

const AppRoutes = () => {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/gates"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <GatesManagement />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Main Navigation Routes */}
          <Route
            path="/gate-screen"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <GateScreen />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Reports />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Users />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Settings />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/zones"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ZonesManagement />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CategoriesManagement />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<UnAuthorized />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Suspense fallback={<div className="hidden" />}>
        <WebSocketStatus />
      </Suspense>
      <PerformanceMonitor />
    </>
  );
};

export default App;
