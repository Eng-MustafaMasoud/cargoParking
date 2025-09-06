import { useField } from "formik";

/**
 * FormikCheckbox component for checkbox fields with Formik integration
 */
const FormikCheckbox = ({
  name,
  label,
  value,
  checked,
  onChange,
  className = "",
  ...props
}) => {
  const [field, meta] = useField({
    name,
    type: "checkbox",
    value,
  });

  const handleChange = (e) => {
    field.onChange(e);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2">
        <input
          {...field}
          {...props}
          type="checkbox"
          checked={checked || field.checked}
          onChange={handleChange}
          className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${className}`}
        />
        {label && (
          <span className="text-sm font-medium text-gray-700">{label}</span>
        )}
      </label>
      {meta.touched && meta.error && (
        <p className="text-sm text-danger-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {meta.error}
        </p>
      )}
    </div>
  );
};

export default FormikCheckbox;
