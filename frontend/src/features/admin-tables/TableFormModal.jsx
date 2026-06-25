import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Button, Input, Select } from "../../components/ui";
import { useCreateTable, useUpdateTable } from "../../hooks/useAdminTables";

/** Form thêm/sửa bàn. Truyền key={table?._id || "new"} để reset state. */
export default function TableFormModal({ table, open, onClose }) {
  const editing = !!table;
  const [tableNumber, setTableNumber] = useState(table?.tableNumber || "");
  const [capacity, setCapacity] = useState(table?.capacity ?? "");
  const [status, setStatus] = useState(table?.status || "available");
  const [qrCodeUrl, setQrCodeUrl] = useState(table?.qrCodeUrl || "");
  const [isActive, setIsActive] = useState(table?.isActive ?? true);
  const [error, setError] = useState("");

  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const saving = createTable.isPending || updateTable.isPending;

  const submit = () => {
    if (!tableNumber.trim()) {
      setError("Số bàn là bắt buộc");
      return;
    }
    const payload = {
      tableNumber: tableNumber.trim(),
      capacity: capacity ? Number(capacity) : null, // null để xoá được sức chứa khi sửa
      status,
      qrCodeUrl: qrCodeUrl.trim() || null,
      isActive,
    };
    const mutation = editing ? updateTable : createTable;
    const vars = editing ? { id: table._id, ...payload } : payload;
    mutation.mutate(vars, {
      onSuccess: () => {
        toast.success(editing ? "Đã cập nhật bàn" : "Đã thêm bàn");
        onClose();
      },
      onError: (e) => toast.error(e.message || "Lưu thất bại"),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Sửa bàn" : "Thêm bàn"}>
      <div className="space-y-4">
        <Input
          label="Số bàn *"
          placeholder="VD: B01"
          value={tableNumber}
          onChange={(e) => {
            setTableNumber(e.target.value);
            setError("");
          }}
          error={error}
        />
        <Input
          label="Sức chứa (số chỗ)"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <Select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="available">Trống</option>
          <option value="reserved">Đã đặt giữ</option>
          {/* occupied do hệ thống tự đặt khi có đơn — chỉ hiện để giữ giá trị hiện tại */}
          {status === "occupied" && <option value="occupied">Đang dùng</option>}
        </Select>
        <Input
          label="Link QR (tuỳ chọn)"
          placeholder="https://..."
          value={qrCodeUrl}
          onChange={(e) => setQrCodeUrl(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-primary"
          />
          Đang hoạt động (hiển thị để đặt)
        </label>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Huỷ bỏ
          </Button>
          <Button onClick={submit} loading={saving}>
            {editing ? "Lưu thay đổi" : "Thêm bàn"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
