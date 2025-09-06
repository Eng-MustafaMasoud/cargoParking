import { Component, useCallback } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import Button from "./Button.jsx";

// Error Fallback Component (Function Component)
const ErrorFallback = ({
  error,
  errorInfo,
  onReset,
  fallback,
  showDetails = false,
}) => {
  if (fallback) {
    return fallback({ error, errorInfo, resetError: onReset });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-danger-50 to-danger-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-large p-8 text-center">
          <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-danger-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Oops! Something went wrong
          </h1>

          <p className="text-gray-600 mb-8 text-lg">
            We encountered an unexpected error. Please try refreshing the page
            or contact support if the problem persists.
          </p>

          {showDetails && error && (
            <div className="mb-8 text-left">
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
                  <Bug className="w-4 h-4 mr-2" />
                  Error Details (Development)
                </summary>
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Error Message:
                    </h4>
                    <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {error.toString()}
                    </pre>
                  </div>
                  {errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Component Stack:
                      </h4>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onReset}
              variant="primary"
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>If this problem persists, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Class Component for Error Boundary (Required for React Error Boundaries)
class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: Date.now(), // Unique ID for this error instance
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Report error to monitoring service in production
    if (import.meta.env.PROD) {
      // Example: Send to error monitoring service
      // errorMonitoringService.captureException(error, {
      //   extra: errorInfo,
      //   tags: { component: 'ErrorBoundary' }
      // });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          fallback={this.props.fallback}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Function Component Wrapper with enhanced props
const ErrorBoundary = ({
  children,
  fallback,
  showDetails = import.meta.env.DEV,
  onError,
  ...props
}) => {
  const handleError = useCallback(
    (error, errorInfo) => {
      if (onError) {
        onError(error, errorInfo);
      }
    },
    [onError]
  );

  return (
    <ErrorBoundaryClass
      fallback={fallback}
      showDetails={showDetails}
      onError={handleError}
      {...props}
    >
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;
