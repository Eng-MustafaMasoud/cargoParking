import { useField } from "formik";

/**
 * FormikCheckboxGroup component for multiple checkboxes with Formik integration
 */
const FormikCheckboxGroup = ({
  name,
  label,
  options = [],
  className = "",
  ...props
}) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (optionValue, checked) => {
    const currentValues = field.value || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter((value) => value !== optionValue);
    }

    helpers.setValue(newValues);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className={`space-y-2 ${className}`}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={(field.value || []).includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {meta.touched && meta.error && (
        <p className="text-sm text-danger-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {meta.error}
        </p>
      )}
    </div>
  );
};

export default FormikCheckboxGroup;
