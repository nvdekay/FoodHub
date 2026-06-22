import { cn } from "../../lib/cn";

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn("rounded-xl border border-gray-100 bg-surface shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}
