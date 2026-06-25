import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Panel trượt từ cạnh phải (dùng cho giỏ hàng).
 * footer: vùng cố định dưới đáy (tổng tiền + nút hành động).
 */
export default function Drawer({ open, onClose, title, children, footer, className }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 transition-opacity duration-300 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex justify-end overflow-hidden">
        <DialogPanel
          transition
          className={cn(
            "flex h-full w-full max-w-md flex-col bg-white shadow-xl",
            "transition duration-300 ease-out data-[closed]:translate-x-full",
            className
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5">{children}</div>
          {footer && <div className="border-t border-gray-100 p-5">{footer}</div>}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
