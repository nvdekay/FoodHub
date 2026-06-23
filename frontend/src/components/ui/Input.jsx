import { forwardRef, useId } from "react";
import { cn } from "../../lib/cn";

const Input = forwardRef(({ label, error, className, id, ...props }, ref) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition",
          "focus:border-primary focus:ring-2 focus:ring-primary/30",
          error && "border-red-400 focus:border-red-400 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
