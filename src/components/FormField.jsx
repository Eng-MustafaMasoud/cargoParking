import { forwardRef } from "react";

/**
 * Reusable form field component with consistent styling and error handling
 */
const FormField = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      touched,
      required = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseInputClasses =
      "w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors";
    const errorClasses =
      touched && error
        ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
        : "border-gray-300";
    const disabledClasses = disabled
      ? "bg-gray-100 cursor-not-allowed"
      : "bg-white";

    const inputClasses = `${baseInputClasses} ${errorClasses} ${disabledClasses} ${className}`;

    const renderInput = () => {
      switch (type) {
        case "textarea":
          return (
            <textarea
              ref={ref}
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={inputClasses}
              rows={props.rows || 3}
              {...props}
            />
          );
        case "select":
          return (
            <select
              ref={ref}
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              className={inputClasses}
              {...props}
            >
              {props.children}
            </select>
          );
        default:
          return (
            <input
              ref={ref}
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={inputClasses}
              {...props}
            />
          );
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        {renderInput()}
        {touched && error && (
          <p className="text-sm text-danger-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
