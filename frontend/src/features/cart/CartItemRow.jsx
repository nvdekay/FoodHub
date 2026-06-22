import { Trash2, UtensilsCrossed } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatVND } from "../../lib/format";
import { QuantityStepper } from "../../components/ui";

/** Một dòng món trong giỏ — dùng chung cho drawer & trang checkout. */
export default function CartItemRow({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const optionText = (item.selectedOptions || []).map((o) => o.choiceLabel).join(" · ");

  return (
    <div className="flex gap-3 py-3">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
          <UtensilsCrossed className="h-6 w-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium text-gray-800">{item.name}</p>
          <button
            onClick={() => removeItem(item.key)}
            className="flex-shrink-0 rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Xoá món"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {optionText && <p className="truncate text-xs text-gray-500">{optionText}</p>}
        {item.note && (
          <p className="truncate text-xs italic text-gray-400">Ghi chú: {item.note}</p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <QuantityStepper
            value={item.quantity}
            onChange={(q) => updateQuantity(item.key, q)}
            size="sm"
          />
          <span className="font-semibold text-primary">{formatVND(item.itemTotal)}</span>
        </div>
      </div>
    </div>
  );
}
