import { useEffect, useState } from "react";

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    chunkLoadTimes: {},
    memoryUsage: 0,
  });

  useEffect(() => {
    // Track page load time
    const loadTime = performance.now();
    setMetrics((prev) => ({ ...prev, loadTime }));

    // Track memory usage if available
    if (performance.memory) {
      setMetrics((prev) => ({
        ...prev,
        memoryUsage: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
      }));
    }

    // Track chunk load times
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const start = performance.now();
      return originalFetch.apply(this, args).then((response) => {
        const end = performance.now();
        const url = args[0];
        if (typeof url === "string" && url.includes(".js")) {
          setMetrics((prev) => ({
            ...prev,
            chunkLoadTimes: {
              ...prev.chunkLoadTimes,
              [url]: end - start,
            },
          }));
        }
        return response;
      });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg font-mono z-50">
      <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
      <div>Chunks: {Object.keys(metrics.chunkLoadTimes).length}</div>
    </div>
  );
};

export default PerformanceMonitor;
