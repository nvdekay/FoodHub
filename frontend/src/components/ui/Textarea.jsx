import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const Textarea = forwardRef(({ label, error, className, id, rows = 3, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      className={cn(
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition",
        "focus:border-primary focus:ring-2 focus:ring-primary/30",
        error && "border-red-400",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

Textarea.displayName = "Textarea";
export default Textarea;
