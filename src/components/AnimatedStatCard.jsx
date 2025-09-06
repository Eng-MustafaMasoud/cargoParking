import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const AnimatedStatCard = ({
  title,
  value,
  change,
  changeType = "positive",
  icon: Icon,
  color = "primary",
  delay = 0,
  showAnimation = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && showAnimation) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [isVisible, value, showAnimation]);

  const colorClasses = {
    primary: {
      bg: "bg-gradient-to-br from-primary-50 to-primary-100",
      icon: "text-primary-600",
      iconBg: "bg-primary-100",
      text: "text-primary-600",
    },
    success: {
      bg: "bg-gradient-to-br from-success-50 to-success-100",
      icon: "text-success-600",
      iconBg: "bg-success-100",
      text: "text-success-600",
    },
    warning: {
      bg: "bg-gradient-to-br from-warning-50 to-warning-100",
      icon: "text-warning-600",
      iconBg: "bg-warning-100",
      text: "text-warning-600",
    },
    danger: {
      bg: "bg-gradient-to-br from-danger-50 to-danger-100",
      icon: "text-danger-600",
      iconBg: "bg-danger-100",
      text: "text-danger-600",
    },
    accent: {
      bg: "bg-gradient-to-br from-accent-50 to-accent-100",
      icon: "text-accent-600",
      iconBg: "bg-accent-100",
      text: "text-accent-600",
    },
  };

  const changeColorClasses = {
    positive: "text-success-600",
    negative: "text-danger-600",
    neutral: "text-gray-600",
  };

  return (
    <motion.div
      ref={cardRef}
      className={`${colorClasses[color].bg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <motion.div
            className="text-3xl font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {typeof displayValue === "number"
              ? displayValue.toLocaleString()
              : displayValue}
          </motion.div>
          {change && (
            <motion.div
              className={`text-sm font-medium mt-2 flex items-center`}
              initial={{ opacity: 0, x: -10 }}
              animate={
                isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
              }
              transition={{ duration: 0.5, delay: delay + 0.4 }}
            >
              <span className={changeColorClasses[changeType]}>
                {changeType === "positive" && "+"}
                {change}
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </motion.div>
          )}
        </div>

        <motion.div
          className={`${colorClasses[color].iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
          initial={{ scale: 0, rotate: -180 }}
          animate={
            isVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }
          }
          transition={{ duration: 0.6, delay: delay + 0.3 }}
        >
          <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
        </motion.div>
      </div>

      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 0.05 } : { opacity: 0 }}
        transition={{ duration: 1, delay: delay + 0.5 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full blur-2xl" />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedStatCard;
