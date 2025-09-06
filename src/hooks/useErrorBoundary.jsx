import { useState, useCallback } from "react";

/**
 * Custom hook for error handling in function components
 * This hook provides error state management and can be used with ErrorBoundary
 */
export const useErrorBoundary = () => {
  const [error, setError] = useState(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error) => {
    setError(error);

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("useErrorBoundary caught an error:", error);
    }
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { captureError, resetError };
};

/**
 * Hook for handling async errors in function components
 * Wraps async functions to catch and handle errors
 */
export const useAsyncError = () => {
  const [, setError] = useState();

  return useCallback((error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

/**
 * Hook for error reporting and logging
 */
export const useErrorReporting = () => {
  const reportError = useCallback((error, errorInfo = {}) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error("Error reported:", error, errorInfo);
    }

    // In production, you might want to send to an error reporting service
    // like Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, errorInfo);
    }
  }, []);

  return { reportError };
};
