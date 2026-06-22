import { Check, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";

const STEPS = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "preparing", label: "Đang làm" },
  { key: "ready", label: "Sẵn sàng" },
  { key: "completed", label: "Hoàn tất" },
];

/** Stepper theo dõi vòng đời đơn. Đơn huỷ hiển thị riêng. */
export default function OrderStatusTimeline({ status, cancelReason }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
        <div>
          <p className="font-medium text-red-700">Đơn đã huỷ</p>
          {cancelReason && <p className="text-sm text-red-600">Lý do: {cancelReason}</p>}
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* line trái */}
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === 0 ? "opacity-0" : done || active ? "bg-primary" : "bg-gray-200"
                )}
              />
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition",
                  done && "border-primary bg-primary text-white",
                  active && "border-primary bg-white text-primary ring-4 ring-primary/15",
                  !done && !active && "border-gray-200 bg-white text-gray-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {/* line phải */}
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === STEPS.length - 1 ? "opacity-0" : done ? "bg-primary" : "bg-gray-200"
                )}
              />
            </div>
            <span
              className={cn(
                "mt-2 text-center text-[11px] leading-tight sm:text-xs",
                active ? "font-semibold text-primary" : done ? "text-gray-700" : "text-gray-400"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
