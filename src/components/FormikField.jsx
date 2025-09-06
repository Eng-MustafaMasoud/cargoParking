import { useField } from "formik";
import FormField from "./FormField.jsx";

const FormikField = ({
  name,
  label,
  type = "text",
  required = false,
  ...props
}) => {
  const [field, meta] = useField(name);

  return (
    <FormField
      {...field}
      {...props}
      name={name}
      label={label}
      type={type}
      required={required}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default FormikField;
