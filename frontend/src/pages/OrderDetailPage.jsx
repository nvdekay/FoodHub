import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Armchair, Clock, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  Card,
  StatusPill,
  Button,
  Skeleton,
  EmptyState,
  ConfirmDialog,
} from "../components/ui";
import { useOrder, useCancelOrder } from "../hooks/useOrders";
import { formatVND, formatDate } from "../lib/format";
import { PAYMENT_METHOD_LABEL } from "../lib/constants";
import OrderStatusTimeline from "../features/orders/OrderStatusTimeline";
import EditOrderModal from "../features/orders/EditOrderModal";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(id);
  const cancelOrder = useCancelOrder(id);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Không tìm thấy đơn"
        description="Đơn không tồn tại hoặc bạn không có quyền xem."
        action={<Button onClick={() => navigate("/orders")}>Về danh sách đơn</Button>}
      />
    );
  }

  const isPending = order.status === "pending";

  const doCancel = () =>
    cancelOrder.mutate(undefined, {
      onSuccess: () => {
        toast.success("Đã huỷ đơn");
        setConfirmOpen(false);
      },
      onError: (e) => {
        toast.error(e.message || "Huỷ đơn thất bại");
        setConfirmOpen(false);
      },
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/orders")}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{order.orderCode}</h1>
          <p className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatDate(order.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Armchair className="h-3.5 w-3.5" /> Bàn {order.tableNumber}
            </span>
          </p>
        </div>
        <StatusPill status={order.status} type="order" />
      </div>

      {/* Timeline */}
      <Card className="p-5">
        <OrderStatusTimeline status={order.status} cancelReason={order.cancelReason} />
      </Card>

      {/* Danh sách món */}
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
                <span className="flex-shrink-0 font-medium text-gray-700">
                  {formatVND(it.itemTotal)}
                </span>
              </div>
            );
          })}
        </div>

        {order.note && (
          <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Ghi chú đơn: {order.note}
          </p>
        )}

        {/* Tổng tiền */}
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Tạm tính</span>
            <span>{formatVND(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Giảm giá</span>
              <span>−{formatVND(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-800">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatVND(order.totalAmount)}</span>
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

      {/* Hành động — chỉ khi pending */}
      {isPending && (
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Sửa đơn
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => setConfirmOpen(true)}>
            <X className="h-4 w-4" /> Huỷ đơn
          </Button>
        </div>
      )}

      {editOpen && (
        <EditOrderModal order={order} open={editOpen} onClose={() => setEditOpen(false)} />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doCancel}
        title="Huỷ đơn"
        message={`Bạn chắc chắn muốn huỷ đơn ${order.orderCode}? Hành động này không thể hoàn tác.`}
        confirmText="Huỷ đơn"
        loading={cancelOrder.isPending}
      />
    </div>
  );
}
