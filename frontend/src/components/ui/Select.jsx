import { forwardRef, useId } from "react";
import { cn } from "../../lib/cn";

const Select = forwardRef(({ label, error, className, id, children, ...props }, ref) => {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition",
          "focus:border-primary focus:ring-2 focus:ring-primary/30",
          error && "border-red-400",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";
export default Select;
