import Modal from "./Modal";
import Button from "./Button";

/** Hộp thoại xác nhận cho hành động phá huỷ (huỷ đơn, xoá...). */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Huỷ bỏ",
  confirmVariant = "danger",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
