import { forwardRef } from "react";

/**
 * Reusable form component with consistent styling
 */
const Form = forwardRef(
  ({ children, onSubmit, className = "", ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={`space-y-6 ${className}`}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = "Form";

export default Form;
