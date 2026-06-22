import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Modal, Button, Textarea, QuantityStepper } from "../../components/ui";
import { formatVND } from "../../lib/format";
import { useCart } from "../../context/CartContext";
import { cn } from "../../lib/cn";

// Lựa chọn mặc định: single -> choice đầu, multiple -> []
const initSelections = (product) => {
  const init = {};
  for (const g of product?.options || []) {
    init[g.name] = g.type === "single" ? g.choices[0]?.label ?? "" : [];
  }
  return init;
};

/** Lưu ý: dùng kèm key={product?._id} để reset state khi đổi món. */
export default function ProductDetailModal({ product, open, onClose }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selections, setSelections] = useState(() => initSelections(product));

  const selectedOptions = useMemo(() => {
    if (!product) return [];
    const out = [];
    for (const g of product.options || []) {
      const sel = selections[g.name];
      if (g.type === "single") {
        const c = g.choices.find((x) => x.label === sel);
        if (c) out.push({ groupName: g.name, choiceLabel: c.label, priceModifier: c.priceModifier });
      } else {
        for (const label of sel || []) {
          const c = g.choices.find((x) => x.label === label);
          if (c) out.push({ groupName: g.name, choiceLabel: c.label, priceModifier: c.priceModifier });
        }
      }
    }
    return out;
  }, [product, selections]);

  const unitPrice = (product?.basePrice || 0) + selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
  const total = unitPrice * quantity;

  const missingRequired = (product?.options || [])
    .filter((g) => g.required && (g.type === "single" ? !selections[g.name] : !(selections[g.name]?.length)))
    .map((g) => g.name);

  const setSingle = (group, label) => setSelections((s) => ({ ...s, [group]: label }));
  const toggleMulti = (group, label) =>
    setSelections((s) => {
      const cur = s[group] || [];
      return { ...s, [group]: cur.includes(label) ? cur.filter((l) => l !== label) : [...cur, label] };
    });

  const onAdd = () => {
    if (missingRequired.length) {
      toast.error(`Vui lòng chọn: ${missingRequired.join(", ")}`);
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl,
      quantity,
      selectedOptions,
      note: note.trim() || undefined,
    });
    toast.success("Đã thêm vào giỏ");
    onClose();
  };

  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose} title={product.name}>
      <div className="space-y-4">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="h-44 w-full rounded-lg object-cover" />
        )}
        {product.description && <p className="text-sm text-gray-500">{product.description}</p>}
        <p className="font-semibold text-primary">{formatVND(product.basePrice)}</p>

        {(product.options || []).map((g) => (
          <div key={g.name}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">{g.name}</span>
              {g.required && <span className="text-xs text-red-500">* bắt buộc</span>}
              <span className="text-xs text-gray-400">
                {g.type === "single" ? "(chọn 1)" : "(chọn nhiều)"}
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {g.choices.map((c) => {
                const checked =
                  g.type === "single"
                    ? selections[g.name] === c.label
                    : (selections[g.name] || []).includes(c.label);
                return (
                  <label
                    key={c.label}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition",
                      checked ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type={g.type === "single" ? "radio" : "checkbox"}
                        name={g.name}
                        checked={checked}
                        onChange={() =>
                          g.type === "single" ? setSingle(g.name, c.label) : toggleMulti(g.name, c.label)
                        }
                        className="accent-primary"
                      />
                      {c.label}
                    </span>
                    {c.priceModifier > 0 && (
                      <span className="text-gray-500">+{formatVND(c.priceModifier)}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <Textarea
          label="Ghi chú"
          placeholder="Ví dụ: ít đá, không đường..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button onClick={onAdd}>Thêm vào giỏ · {formatVND(total)}</Button>
        </div>
      </div>
    </Modal>
  );
}
