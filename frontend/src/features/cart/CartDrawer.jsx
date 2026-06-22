import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Drawer, Button, EmptyState } from "../../components/ui";
import { useCart } from "../../context/CartContext";
import { formatVND } from "../../lib/format";
import CartItemRow from "./CartItemRow";

/** Giỏ hàng dạng panel trượt (mở từ icon giỏ ở header). */
export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { items, subtotal, totalCount } = useCart();

  const goCheckout = () => {
    onClose();
    navigate("/cart");
  };

  const footer =
    items.length > 0 ? (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Tạm tính</span>
          <span className="text-lg font-bold text-gray-800">{formatVND(subtotal)}</span>
        </div>
        <Button className="w-full" size="lg" onClick={goCheckout}>
          Tiến hành đặt món
        </Button>
      </div>
    ) : null;

  return (
    <Drawer open={open} onClose={onClose} title={`Giỏ hàng (${totalCount})`} footer={footer}>
      {items.length === 0 ? (
        <div className="py-10">
          <EmptyState
            icon={ShoppingCart}
            title="Giỏ hàng trống"
            description="Hãy chọn vài món yêu thích từ thực đơn nhé!"
            action={
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
              >
                Xem thực đơn
              </Button>
            }
          />
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <CartItemRow key={item.key} item={item} />
          ))}
        </div>
      )}
    </Drawer>
  );
}
