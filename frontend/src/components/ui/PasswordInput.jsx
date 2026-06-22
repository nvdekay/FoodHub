import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/cn";

/** Ô nhập mật khẩu có nút ẩn/hiện. Tương thích react-hook-form (forwardRef). */
const PasswordInput = forwardRef(({ label, error, className, id, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? "text" : "password"}
          className={cn(
            "w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none transition",
            "focus:border-primary focus:ring-2 focus:ring-primary/30",
            error && "border-red-400 focus:border-red-400 focus:ring-red-200",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:text-gray-600"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
