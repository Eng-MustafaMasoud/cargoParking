import { Loader2 } from "lucide-react";

const Loading = ({
  size = "md",
  text = "Loading...",
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} text-primary-600 animate-spin`}
      />
      {text && (
        <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-soft p-8">{content}</div>
      </div>
    );
  }

  return content;
};

export default Loading;
