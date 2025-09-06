// React is auto-injected by Vite
import LoadingSpinner from "./LoadingSpinner.jsx";

const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  icon,
  iconPosition = "left",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-glow focus:ring-primary-500",
    secondary:
      "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-lg focus:ring-gray-500",
    success:
      "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-lg hover:shadow-glow focus:ring-success-500",
    warning:
      "bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-lg hover:shadow-glow focus:ring-warning-500",
    danger:
      "bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-700 shadow-lg hover:shadow-glow focus:ring-danger-500",
    outline:
      "border-2 border-primary-300 text-primary-700 bg-white/90 backdrop-blur-sm hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-500 shadow-sm hover:shadow-md",
    ghost: "text-primary-700 hover:bg-primary-50 focus:ring-primary-500",
    glass:
      "bg-white/20 backdrop-blur-md text-gray-700 hover:bg-white/40 focus:ring-primary-500 border border-white/30",
    accent:
      "bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-glow focus:ring-accent-500",
  };

  const sizeClasses = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {!isLoading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {!isLoading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
