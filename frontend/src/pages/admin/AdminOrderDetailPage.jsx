import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Armchair, Clock, User, Phone } from "lucide-react";
import { Card, StatusPill, Button, Skeleton, EmptyState } from "../../components/ui";
import { useOrder } from "../../hooks/useOrders";
import { formatVND, formatDate } from "../../lib/format";
import { PAYMENT_METHOD_LABEL } from "../../lib/constants";
import { ORDER_STATUS_CONFIG } from "../../lib/statusConfig";
import OrderActions from "../../features/admin-orders/OrderActions";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Không tìm thấy đơn"
        description="Đơn không tồn tại."
        action={<Button onClick={() => navigate("/admin/orders")}>Về danh sách</Button>}
      />
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/orders")}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{order.orderCode}</h1>
          <p className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(order.createdAt)}</span>
            <span className="flex items-center gap-1"><Armchair className="h-3.5 w-3.5" /> Bàn {order.tableNumber}</span>
          </p>
        </div>
        <StatusPill status={order.status} type="order" />
      </div>

      {/* Hành động */}
      <Card className="p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Hành động</p>
        <OrderActions order={order} variant="full" />
      </Card>

      {/* Khách hàng */}
      <Card className="flex flex-wrap gap-x-6 gap-y-1 p-4 text-sm">
        <span className="flex items-center gap-1.5 text-gray-600">
          <User className="h-4 w-4 text-gray-400" /> {order.customerInfo?.fullName}
        </span>
        <span className="flex items-center gap-1.5 text-gray-600">
          <Phone className="h-4 w-4 text-gray-400" /> {order.customerInfo?.phone}
        </span>
      </Card>

      {/* Món */}
      <Card className="p-4">
        <h2 className="mb-2 font-semibold text-gray-800">Món đã đặt</h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((it, i) => {
            const optionText = (it.selectedOptions || []).map((o) => o.choiceLabel).join(" · ");
            return (
              <div key={i} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800">
                    <span className="text-gray-500">{it.quantity}×</span> {it.name}
                  </p>
                  {optionText && <p className="text-xs text-gray-500">{optionText}</p>}
                  {it.note && <p className="text-xs italic text-gray-400">Ghi chú: {it.note}</p>}
                </div>
                <span className="flex-shrink-0 font-medium text-gray-700">{formatVND(it.itemTotal)}</span>
              </div>
            );
          })}
        </div>
        {order.note && (
          <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">Ghi chú đơn: {order.note}</p>
        )}
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-500"><span>Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-gray-500"><span>Giảm giá</span><span>−{formatVND(order.discountAmount)}</span></div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-800">
            <span>Tổng cộng</span><span className="text-primary">{formatVND(order.totalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Thanh toán */}
      <Card className="flex items-center justify-between p-4">
        <span className="text-sm font-medium text-gray-700">Thanh toán</span>
        <div className="flex items-center gap-2">
          {order.paymentMethod && (
            <span className="text-sm text-gray-500">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</span>
          )}
          <StatusPill status={order.paymentStatus} type="payment" />
        </div>
      </Card>

      {/* Lịch sử trạng thái */}
      <Card className="p-4">
        <h2 className="mb-3 font-semibold text-gray-800">Lịch sử trạng thái</h2>
        <ol className="space-y-3">
          {[...(order.statusHistory || [])].reverse().map((h, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {ORDER_STATUS_CONFIG[h.status]?.label || h.status}
                </p>
                <p className="text-xs text-gray-400">{formatDate(h.changedAt)}</p>
                {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
