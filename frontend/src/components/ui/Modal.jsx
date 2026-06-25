import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export default function Modal({ open, onClose, title, children, className }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <DialogPanel
          transition
          className={cn(
            "max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl",
            "transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-6",
            "sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95",
            className
          )}
        >
          {title && (
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
          )}
          <div className="p-5">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
