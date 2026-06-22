import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  const totalCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.itemTotal, 0), [items]);

  const value = { items, addItem, updateQuantity, removeItem, clear, totalCount, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
