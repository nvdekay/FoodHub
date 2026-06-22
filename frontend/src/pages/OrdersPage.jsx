import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReceiptText } from "lucide-react";
import { Pagination, EmptyState, Skeleton, Button } from "../components/ui";
import { useMyOrders } from "../hooks/useOrders";
import { ORDER_STATUS_CONFIG } from "../lib/statusConfig";
import { cn } from "../lib/cn";
import OrderCard from "../features/orders/OrderCard";

const LIMIT = 10;
const FILTERS = [
  { value: "", label: "Tất cả" },
  ...Object.entries(ORDER_STATUS_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label })),
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params = { page, limit: LIMIT, ...(status ? { status } : {}) };
  const { data: res, isLoading, isError } = useMyOrders(params);
  const orders = res?.data || [];
  const pagination = res?.pagination;

  const onFilter = (v) => {
    setStatus(v);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Đơn của tôi</h1>
        <p className="text-sm text-gray-500">Theo dõi trạng thái các đơn đã đặt</p>
      </div>

      {/* Lọc trạng thái */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => onFilter(f.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition",
              status === f.value
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Nội dung */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Không tải được danh sách đơn"
          description="Vui lòng thử lại sau."
          action={<Button onClick={() => window.location.reload()}>Thử lại</Button>}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Chưa có đơn nào"
          description="Hãy chọn món và đặt đơn đầu tiên của bạn nhé!"
          action={<Button onClick={() => navigate("/")}>Xem thực đơn</Button>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o._id} order={o} />
          ))}
        </div>
      )}

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
      )}
    </div>
  );
}
