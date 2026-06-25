import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "foodhub_cart";
const CartContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải dùng trong <CartProvider>");
  return ctx;
};

// Chữ ký tuỳ chọn để gộp các dòng cùng cấu hình.
// Dùng JSON (không nối chuỗi thủ công) để nhãn chứa ký tự ":" / "|" không gây đụng độ,
// và đưa cả priceModifier vào khoá để hai lựa chọn cùng nhãn nhưng khác phụ phí không bị gộp.
const optionSignature = (selectedOptions = []) =>
  JSON.stringify(
    selectedOptions
      .map((o) => [o.groupName, o.choiceLabel, o.priceModifier || 0])
      .sort((a, b) => {
        if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
        if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;
        return a[2] - b[2];
      })
  );

const computeUnit = (basePrice, selectedOptions = []) =>
  basePrice + selectedOptions.reduce((s, o) => s + (o.priceModifier || 0), 0);

// Số lượng tối đa mỗi dòng (đồng bộ với max của QuantityStepper).
const MAX_ITEM_QTY = 99;

// Ép số lượng về số nguyên hợp lệ trong [0, MAX_ITEM_QTY]; giá trị rác/NaN → 0.
const sanitizeQty = (q) => {
  const n = Math.floor(Number(q));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_ITEM_QTY, n);
};

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
    const addQty = sanitizeQty(quantity);
    if (addQty === 0) return; // không thêm số lượng không hợp lệ
    const key = `${productId}__${optionSignature(selectedOptions)}`;
    const unitPrice = computeUnit(basePrice, selectedOptions);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) {
        const next = [...prev];
        // Cộng dồn nhưng không vượt quá giới hạn mỗi dòng.
        const q = Math.min(MAX_ITEM_QTY, next[idx].quantity + addQty);
        next[idx] = { ...next[idx], quantity: q, itemTotal: unitPrice * q };
        return next;
      }
      return [
        ...prev,
        { key, productId, name, basePrice, imageUrl, quantity: addQty, selectedOptions, note, unitPrice, itemTotal: unitPrice * addQty },
      ];
    });
  };

  const updateQuantity = (key, quantity) => {
    const q = sanitizeQty(quantity);
    setItems((prev) =>
      q === 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity: q, itemTotal: i.unitPrice * q } : i))
    );
  };

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
