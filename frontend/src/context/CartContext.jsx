import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "foodhub_cart";
const CartContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải dùng trong <CartProvider>");
  return ctx;
};

// Chữ ký tuỳ chọn để gộp các dòng cùng cấu hình
const optionSignature = (selectedOptions = []) =>
  selectedOptions
    .map((o) => `${o.groupName}:${o.choiceLabel}`)
    .sort()
    .join("|");

const computeUnit = (basePrice, selectedOptions = []) =>
  basePrice + selectedOptions.reduce((s, o) => s + (o.priceModifier || 0), 0);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = ({ productId, name, basePrice, imageUrl, quantity, selectedOptions, note }) => {
    const key = `${productId}__${optionSignature(selectedOptions)}`;
    const unitPrice = computeUnit(basePrice, selectedOptions);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) {
        const next = [...prev];
        const q = next[idx].quantity + quantity;
        next[idx] = { ...next[idx], quantity: q, itemTotal: unitPrice * q };
        return next;
      }
      return [
        ...prev,
        { key, productId, name, basePrice, imageUrl, quantity, selectedOptions, note, unitPrice, itemTotal: unitPrice * quantity },
      ];
    });
  };

  const updateQuantity = (key, quantity) =>
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity, itemTotal: i.unitPrice * quantity } : i))
    );

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  /**
   * Đồng bộ giá giỏ với thực đơn mới nhất (basePrice có thể đã đổi sau khi thêm vào giỏ).
   * `productMap`: Map<productId, product>. Chỉ ghi lại state khi thực sự có thay đổi.
   */
  const reconcilePrices = useCallback((productMap) => {
    setItems((prev) => {
      let changed = false;
      const next = prev.map((i) => {
        const p = productMap.get(i.productId);
        if (!p || typeof p.basePrice !== "number") return i;
        const unitPrice = computeUnit(p.basePrice, i.selectedOptions);
        if (p.basePrice === i.basePrice && unitPrice === i.unitPrice) return i;
        changed = true;
        return { ...i, basePrice: p.basePrice, unitPrice, itemTotal: unitPrice * i.quantity };
      });
      return changed ? next : prev;
    });
  }, []);

  const totalCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.itemTotal, 0), [items]);

  const value = { items, addItem, updateQuantity, removeItem, clear, reconcilePrices, totalCount, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
