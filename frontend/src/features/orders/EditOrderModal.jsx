import { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, Button, Select, Textarea, QuantityStepper } from "../../components/ui";
import { useTables } from "../../hooks/useTables";
import { useUpdateOrder } from "../../hooks/useOrders";
import { formatVND } from "../../lib/format";

// Đơn giá 1 dòng = giá gốc snapshot + tổng phụ phí tuỳ chọn
const lineUnit = (it) =>
  it.unitPrice + (it.selectedOptions || []).reduce((s, o) => s + (o.priceModifier || 0), 0);

/**
 * Sửa đơn khi pending: đổi số lượng / xoá dòng / đổi bàn / ghi chú.
 * BE re-snapshot & tính lại tổng tiền. (Thêm món mới làm ở luồng menu.)
 */
export default function EditOrderModal({ order, open, onClose }) {
  const [lines, setLines] = useState(() =>
    (order.items || []).map((it, i) => ({ ...it, _k: i }))
  );
  const [tableId, setTableId] = useState(order.tableId);
  const [note, setNote] = useState(order.note || "");

  const { data: tables = [] } = useTables({ isActive: true });
  const updateOrder = useUpdateOrder(order._id);

  const setQty = (k, q) =>
    setLines((prev) => prev.map((l) => (l._k === k ? { ...l, quantity: q } : l)));
  const removeLine = (k) => setLines((prev) => prev.filter((l) => l._k !== k));

  const subtotal = lines.reduce((s, l) => s + lineUnit(l) * l.quantity, 0);

  const submit = () => {
    if (lines.length === 0) {
      toast.error("Đơn phải còn ít nhất 1 món");
      return;
    }
    const payload = {
      tableId,
      note: note.trim() || undefined,
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        selectedOptions: (l.selectedOptions || []).map((o) => ({
          groupName: o.groupName,
          choiceLabel: o.choiceLabel,
        })),
        note: l.note || undefined,
      })),
    };
    updateOrder.mutate(payload, {
      onSuccess: () => {
        toast.success("Đã cập nhật đơn");
        onClose();
      },
      onError: (e) => {
        toast.error(e.message || "Cập nhật thất bại");
        if (e.errorCode === "ORDER_NOT_EDITABLE") onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Sửa đơn">
      <div className="space-y-4">
        <div className="divide-y divide-gray-100">
          {lines.map((l) => {
            const optionText = (l.selectedOptions || []).map((o) => o.choiceLabel).join(" · ");
            return (
              <div key={l._k} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800">{l.name}</p>
                  {optionText && <p className="truncate text-xs text-gray-500">{optionText}</p>}
                  <p className="mt-1 text-xs text-gray-400">{formatVND(lineUnit(l))} / món</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <QuantityStepper value={l.quantity} onChange={(q) => setQty(l._k, q)} size="sm" />
                  <button
                    onClick={() => removeLine(l._k)}
                    className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Xoá món"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {lines.length === 0 && (
            <p className="py-3 text-sm text-red-600">Đơn phải còn ít nhất 1 món.</p>
          )}
        </div>

        <Select label="Bàn" value={tableId} onChange={(e) => setTableId(e.target.value)}>
          {/* giữ bàn hiện tại nếu không nằm trong danh sách active */}
          {!tables.some((t) => t._id === tableId) && (
            <option value={tableId}>Bàn {order.tableNumber}</option>
          )}
          {tables.map((t) => (
            <option key={t._id} value={t._id}>
              Bàn {t.tableNumber}
              {t.capacity ? ` · ${t.capacity} chỗ` : ""}
            </option>
          ))}
        </Select>

        <Textarea
          label="Ghi chú đơn"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú cho đơn..."
        />

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="text-sm">
            <span className="text-gray-500">Tạm tính: </span>
            <span className="font-bold text-gray-800">{formatVND(subtotal)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={updateOrder.isPending}>
              Huỷ bỏ
            </Button>
            <Button onClick={submit} loading={updateOrder.isPending}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
