const Card = ({
  children,
  className = "",
  title,
  subtitle,
  actions,
  variant = "default",
  hover = true,
  padding = "default",
}) => {
  const baseClasses = `rounded-2xl shadow-card border border-gray-200/50 transition-all duration-300 ${
    hover ? "hover:shadow-card-hover hover:-translate-y-1" : ""
  } animate-fade-in-up`;

  const variantClasses = {
    default: "bg-white/95 backdrop-blur-sm border-gray-200/50",
    glass: "bg-white/20 backdrop-blur-md border-white/30",
    primary:
      "bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200/50",
    success:
      "bg-gradient-to-br from-success-50 to-success-100 border-success-200/50",
    warning:
      "bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200/50",
    danger:
      "bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200/50",
    accent:
      "bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200/50",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 border-b border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">{actions}</div>
            )}
          </div>
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
};

export default Card;
