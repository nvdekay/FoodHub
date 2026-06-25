import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Button, Input, Select, Textarea } from "../../components/ui";
import { formatVND } from "../../lib/format";
import { PAYMENT_METHOD, PAYMENT_METHOD_LABEL } from "../../lib/constants";
import {
  useConfirmOrder,
  useSetOrderStatus,
  useCancelOrderStaff,
  useUpdatePayment,
} from "../../hooks/useStaffOrders";

// Nhãn nút cho bước chuyển trạng thái kế tiếp
const NEXT_STATUS = {
  confirmed: { status: "preparing", label: "Bắt đầu làm" },
  preparing: { status: "ready", label: "Sẵn sàng" },
  ready: { status: "completed", label: "Hoàn tất" },
};

/**
 * Nút hành động theo state machine.
 * variant="row": chỉ bước chuyển trạng thái chính (xử lý nhanh ở bảng).
 * variant="full": đủ xác nhận(+giảm giá), huỷ(+lý do), thanh toán.
 */
export default function OrderActions({ order, variant = "full" }) {
  const confirm = useConfirmOrder();
  const setStatus = useSetOrderStatus();
  const cancel = useCancelOrderStaff();
  const payment = useUpdatePayment();

  const [discountOpen, setDiscountOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [discount, setDiscount] = useState("");
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHOD[0]);

  const s = order.status;
  const isFull = variant === "full";

  // Giảm giá hợp lệ phải nằm trong [0, subtotal] và là số hữu hạn.
  const rawDiscount = discount.trim();
  const parsedDiscount = Number(rawDiscount);
  const clampedDiscount = Number.isFinite(parsedDiscount)
    ? Math.min(order.subtotal, Math.max(0, parsedDiscount))
    : 0;

  const run = (mutation, vars, okMsg, after) =>
    mutation.mutate(vars, {
      onSuccess: () => {
        toast.success(okMsg);
        after?.();
      },
      onError: (e) => toast.error(e.message || "Thao tác thất bại"),
    });

  const buttons = [];

  if (s === "pending") {
    buttons.push(
      <Button
        key="confirm"
        size="sm"
        loading={confirm.isPending}
        onClick={() =>
          isFull
            ? setDiscountOpen(true)
            : run(confirm, { id: order._id }, "Đã xác nhận đơn")
        }
      >
        Xác nhận
      </Button>
    );
  }

  const next = NEXT_STATUS[s];
  if (next) {
    buttons.push(
      <Button
        key="next"
        size="sm"
        loading={setStatus.isPending}
        onClick={() => run(setStatus, { id: order._id, status: next.status }, `Đã chuyển: ${next.label}`)}
      >
        {next.label}
      </Button>
    );
  }

  if (isFull && ["pending", "confirmed"].includes(s)) {
    buttons.push(
      <Button key="cancel" size="sm" variant="danger" onClick={() => setCancelOpen(true)}>
        Huỷ đơn
      </Button>
    );
  }

  if (isFull && s !== "cancelled" && order.paymentStatus === "unpaid") {
    buttons.push(
      <Button key="pay" size="sm" variant="outline" onClick={() => setPayOpen(true)}>
        Thanh toán
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.length ? buttons : <span className="text-xs text-gray-400">—</span>}

      {/* Modal xác nhận + giảm giá */}
      <Modal open={discountOpen} onClose={() => setDiscountOpen(false)} title="Xác nhận đơn">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tổng tiền món</span>
            <span className="font-medium">{formatVND(order.subtotal)}</span>
          </div>
          <Input
            label="Giảm giá (đ) — tuỳ chọn"
            type="number"
            min="0"
            max={order.subtotal}
            placeholder="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          <div className="flex justify-between text-sm font-semibold">
            <span>Khách phải trả</span>
            <span className="text-primary">
              {formatVND(order.subtotal - clampedDiscount)}
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDiscountOpen(false)} disabled={confirm.isPending}>
              Huỷ bỏ
            </Button>
            <Button
              loading={confirm.isPending}
              onClick={() =>
                run(
                  confirm,
                  // Để trống = không giảm giá (gửi ""); ngược lại gửi giá trị đã clamp.
                  { id: order._id, discountAmount: rawDiscount === "" ? "" : clampedDiscount },
                  "Đã xác nhận đơn",
                  () => {
                    setDiscountOpen(false);
                    setDiscount("");
                  }
                )
              }
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal huỷ đơn + lý do */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Huỷ đơn">
        <div className="space-y-4">
          <Textarea
            label="Lý do huỷ"
            placeholder="Ví dụ: khách đổi ý, hết nguyên liệu..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCancelOpen(false)} disabled={cancel.isPending}>
              Đóng
            </Button>
            <Button
              variant="danger"
              loading={cancel.isPending}
              onClick={() =>
                run(cancel, { id: order._id, cancelReason: reason.trim() || undefined }, "Đã huỷ đơn", () => {
                  setCancelOpen(false);
                  setReason("");
                })
              }
            >
              Xác nhận huỷ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal thanh toán */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Thanh toán đơn">
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-semibold">
            <span>Số tiền</span>
            <span className="text-primary">{formatVND(order.totalAmount)}</span>
          </div>
          <Select label="Phương thức" value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAYMENT_METHOD.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABEL[m]}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPayOpen(false)} disabled={payment.isPending}>
              Huỷ bỏ
            </Button>
            <Button
              loading={payment.isPending}
              onClick={() =>
                run(
                  payment,
                  { id: order._id, paymentStatus: "paid", paymentMethod: method },
                  "Đã ghi nhận thanh toán",
                  () => setPayOpen(false)
                )
              }
            >
              Xác nhận đã thu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
