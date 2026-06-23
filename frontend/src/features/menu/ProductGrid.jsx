import { cn } from "../../lib/cn";

/** Lưới hiển thị món — gom 1 chỗ để các trang/skeleton không lệch breakpoint. */
export default function ProductGrid({ children, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className
      )}
    >
      {children}
    </div>
  );
}
