import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Select, Textarea, EmptyState, Card, Spinner } from "../components/ui";
import { useCart } from "../context/CartContext";
import { useTables } from "../hooks/useTables";
import { useCreateOrder } from "../hooks/useOrders";
import { useProducts } from "../hooks/useMenu";
import { formatVND } from "../lib/format";
import CartItemRow from "../features/cart/CartItemRow";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, clear, reconcilePrices } = useCart();
  const [tableId, setTableId] = useState("");
  const [note, setNote] = useState("");

  // Đồng bộ giá giỏ với thực đơn mới nhất: basePrice có thể đã đổi từ lúc thêm vào giỏ
  // (giỏ lưu ở localStorage và tồn tại lâu dài). Báo cho khách nếu có món đổi giá.
  const { data: productRes } = useProducts({ limit: 200, isAvailable: true });
  const products = productRes?.data;
  useEffect(() => {
    if (!products?.length) return;
    const map = new Map(products.map((p) => [p._id, p]));
    const stale = items.some((i) => {
      const p = map.get(i.productId);
      return p && typeof p.basePrice === "number" && p.basePrice !== i.basePrice;
    });
    reconcilePrices(map);
    if (stale) toast("Giá một số món đã được cập nhật theo thực đơn mới nhất.", { icon: "💰" });
    // Chạy lại mỗi khi danh sách sản phẩm đổi; items cố tình bỏ khỏi deps để chỉ báo 1 lần.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, reconcilePrices]);

  // Chỉ lấy bàn đang hoạt động để khách chọn
  const { data: tables = [], isLoading: tablesLoading, isError: tablesError } = useTables({
    isActive: true,
  });
  const createOrder = useCreateOrder();

  // Giỏ trống → trạng thái empty
  if (items.length === 0) {
    return (
      <div className="py-10">
        <EmptyState
          icon={ShoppingCart}
          title="Giỏ hàng trống"
          description="Bạn chưa thêm món nào. Khám phá thực đơn để bắt đầu nhé!"
          action={<Button onClick={() => navigate("/")}>Xem thực đơn</Button>}
        />
      </div>
    );
  }

  const submit = () => {
    if (!tableId) {
      toast.error("Vui lòng chọn bàn");
      return;
    }
    const payload = {
      tableId,
      note: note.trim() || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        selectedOptions: (i.selectedOptions || []).map((o) => ({
          groupName: o.groupName,
          choiceLabel: o.choiceLabel,
        })),
        note: i.note || undefined,
      })),
    };

    createOrder.mutate(payload, {
      onSuccess: (order) => {
        clear();
        toast.success("Đặt món thành công!");
        navigate(`/orders/${order._id}`);
      },
      onError: (e) => toast.error(e.message || "Đặt món thất bại, vui lòng thử lại"),
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          aria-label="Quay lại thực đơn"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng & Đặt món</h1>
          <p className="text-sm text-gray-500">Kiểm tra món, chọn bàn rồi đặt đơn</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Danh sách món */}
        <Card className="p-4">
          <h2 className="mb-1 font-semibold text-gray-800">Món đã chọn</h2>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <CartItemRow key={item.key} item={item} />
            ))}
          </div>
        </Card>

        {/* Thông tin đặt đơn */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="space-y-4 p-4">
            <h2 className="font-semibold text-gray-800">Thông tin đặt món</h2>

            {tablesLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner className="h-4 w-4" /> Đang tải danh sách bàn...
              </div>
            ) : tablesError ? (
              <p className="text-sm text-red-600">Không tải được danh sách bàn. Thử lại sau.</p>
            ) : (
              <Select
                label="Chọn bàn *"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
              >
                <option value="">-- Chọn bàn --</option>
                {tables.map((t) => (
                  <option key={t._id} value={t._id}>
                    Bàn {t.tableNumber}
                    {t.capacity ? ` · ${t.capacity} chỗ` : ""}
                    {t.status === "occupied" ? " (đang dùng)" : ""}
                  </option>
                ))}
              </Select>
            )}

            <Textarea
              label="Ghi chú đơn"
              placeholder="Ví dụ: mang ra sớm giúp mình..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span>{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatVND(subtotal)}</span>
              </div>
              <p className="pt-1 text-xs text-gray-400">
                * Tổng tiền chính thức được hệ thống tính lại khi đặt đơn.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={submit}
              loading={createOrder.isPending}
              disabled={createOrder.isPending}
            >
              Đặt món
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
