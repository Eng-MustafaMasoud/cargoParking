import { useField } from "formik";
import FormField from "./FormField.jsx";

/**
 * FormikSelect component for select fields with Formik integration
 */
const FormikSelect = ({
  name,
  label,
  required = false,
  options = [],
  placeholder = "Select an option",
  ...props
}) => {
  const [field, meta] = useField(name);

  return (
    <FormField
      {...field}
      {...props}
      name={name}
      label={label}
      type="select"
      required={required}
      error={meta.error}
      touched={meta.touched}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </FormField>
  );
};

export default FormikSelect;
