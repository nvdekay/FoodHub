import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const Input = forwardRef(({ label, error, className, id, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition",
        "focus:border-primary focus:ring-2 focus:ring-primary/30",
        error && "border-red-400 focus:border-red-400 focus:ring-red-200",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

Input.displayName = "Input";
export default Input;
