import { Link } from "react-router-dom";
import { ChevronRight, Armchair, Clock } from "lucide-react";
import { Card, StatusPill } from "../../components/ui";
import { formatVND, formatDate } from "../../lib/format";

/** Thẻ tóm tắt 1 đơn trong danh sách "Đơn của tôi". */
export default function OrderCard({ order }) {
  const itemCount = order.items?.reduce((s, it) => s + it.quantity, 0) || 0;

  return (
    <Link to={`/orders/${order._id}`} className="block">
      <Card className="p-4 transition hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-800">{order.orderCode}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" /> {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusPill status={order.status} type="order" />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Armchair className="h-4 w-4" /> Bàn {order.tableNumber}
            </span>
            <span>· {itemCount} món</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-primary">{formatVND(order.totalAmount)}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
