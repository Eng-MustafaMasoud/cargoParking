import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const AnimatedChart = ({
  data,
  type = "line",
  height = 300,
  color = "primary",
  showAnimation = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    success: "from-success-500 to-success-600",
    warning: "from-warning-500 to-warning-600",
    danger: "from-danger-500 to-danger-600",
    accent: "from-accent-500 to-accent-600",
  };

  const renderLineChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const points = data
      .map((point, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((point.value - minValue) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="relative w-full h-full">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`gradient-${color}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <motion.polygon
            points={`0,100 ${points} 100,100`}
            fill={`url(#gradient-${color})`}
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;

            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="currentColor"
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  isVisible
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0, opacity: 0 }
                }
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const renderBarChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d) => d.value));
    const barWidth = 100 / data.length;

    return (
      <div className="flex items-end justify-between h-full px-2">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;

          return (
            <motion.div
              key={index}
              className="flex-1 mx-0.5 relative group"
              initial={{ height: 0 }}
              animate={isVisible ? { height: `${height}%` } : { height: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div
                className={`w-full bg-gradient-to-t ${colorClasses[color]} rounded-t-lg relative overflow-hidden`}
                style={{ height: "100%" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  animate={isVisible ? { x: "100%" } : { x: "-100%" }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                />
              </div>

              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.label}: {item.value}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = () => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="relative w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const x1 = 50 + 40 * Math.cos(startAngleRad);
            const y1 = 50 + 40 * Math.sin(startAngleRad);
            const x2 = 50 + 40 * Math.cos(endAngleRad);
            const y2 = 50 + 40 * Math.sin(endAngleRad);

            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`,
            ].join(" ");

            currentAngle += angle;

            return (
              <motion.path
                key={index}
                d={pathData}
                fill={`hsl(${index * 60}, 70%, 60%)`}
                initial={{ scale: 0, rotate: -180 }}
                animate={
                  isVisible
                    ? { scale: 1, rotate: 0 }
                    : { scale: 0, rotate: -180 }
                }
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div
      ref={chartRef}
      className={`w-full h-${height} text-${color}-500`}
      style={{ height: `${height}px` }}
    >
      {type === "line" && renderLineChart()}
      {type === "bar" && renderBarChart()}
      {type === "pie" && renderPieChart()}
    </div>
  );
};

export default AnimatedChart;
