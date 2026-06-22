import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

/** Bộ tăng/giảm số lượng (− số +). Dùng ở modal chi tiết món & giỏ hàng. */
export default function QuantityStepper({ value, onChange, min = 1, max = 99, size = "md" }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const btn = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={cn(
          "flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40",
          btn
        )}
        aria-label="Giảm"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className={cn(
          "flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40",
          btn
        )}
        aria-label="Tăng"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
