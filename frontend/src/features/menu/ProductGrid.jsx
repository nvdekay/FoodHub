import { Children } from "react";
import { cn } from "../../lib/cn";

/**
 * Lưới hiển thị món — gom 1 chỗ để các trang/skeleton không lệch breakpoint.
 * Mỗi ô nổi lên lần lượt (stagger); delay được giới hạn để danh sách dài
 * không phải chờ lâu, và tự tắt khi người dùng bật prefers-reduced-motion.
 */
export default function ProductGrid({ children, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className
      )}
    >
      {Children.map(children, (child, i) => (
        <div className="h-full animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
          {child}
        </div>
      ))}
    </div>
  );
}
