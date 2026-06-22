import { Card } from "../../components/ui";
import { ORDER_STATUS_CONFIG } from "../../lib/statusConfig";
import { cn } from "../../lib/cn";

// Màu thanh đặc cho từng trạng thái (đồng bộ tinh thần với StatusPill)
const BAR_COLOR = {
  pending: "bg-gray-400",
  confirmed: "bg-blue-500",
  preparing: "bg-amber-500",
  ready: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

/** Biểu đồ thanh ngang: số đơn theo trạng thái. */
export default function OrdersByStatusChart({ data }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, c]) => c));

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-semibold text-gray-800">Đơn theo trạng thái</h2>
      <div className="space-y-3">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-3">
            <span className="w-24 flex-shrink-0 text-sm text-gray-600">
              {ORDER_STATUS_CONFIG[status]?.label || status}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn("h-full rounded-full transition-all", BAR_COLOR[status])}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-gray-700">
              {count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
