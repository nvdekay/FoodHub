import { Trophy } from "lucide-react";
import { Card, EmptyState } from "../../components/ui";
import { formatVND } from "../../lib/format";
import { cn } from "../../lib/cn";

// Màu huy chương cho top 3
const RANK = ["bg-amber-100 text-amber-700", "bg-gray-100 text-gray-600", "bg-orange-100 text-orange-700"];

/** Bảng top món bán chạy (theo số lượng bán từ đơn hoàn tất). */
export default function TopProductsTable({ data }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 font-semibold text-gray-800">Món bán chạy</h2>
      {!data || data.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Chưa có dữ liệu"
          description="Chưa có đơn hoàn tất nào để thống kê."
          className="border-0 bg-transparent p-4"
        />
      ) : (
        <div className="space-y-1">
          {data.map((p, i) => (
            <div
              key={p.productId}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-gray-50"
            >
              <span
                className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  RANK[i] || "bg-gray-50 text-gray-400"
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{p.name}</span>
              <span className="flex-shrink-0 text-sm text-gray-500">{p.totalQuantity} đã bán</span>
              <span className="w-24 flex-shrink-0 text-right text-sm font-medium text-primary">
                {formatVND(p.totalRevenue)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
