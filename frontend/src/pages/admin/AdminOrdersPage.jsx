import { useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Card, Select, Input, StatusPill, Pagination, EmptyState, Skeleton, Button } from "../../components/ui";
import { useStaffOrders } from "../../hooks/useStaffOrders";
import { useTables } from "../../hooks/useTables";
import { ORDER_STATUS_CONFIG } from "../../lib/statusConfig";
import { formatVND, formatDate } from "../../lib/format";
import OrderActions from "../../features/admin-orders/OrderActions";

const LIMIT = 15;

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [tableId, setTableId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data: tables = [] } = useTables();

  const params = {
    page,
    limit: LIMIT,
    ...(status ? { status } : {}),
    ...(tableId ? { tableId } : {}),
    ...(from ? { from: `${from}T00:00:00` } : {}),
    ...(to ? { to: `${to}T23:59:59` } : {}),
  };
  const { data: res, isLoading, isError } = useStaffOrders(params);
  const orders = res?.data || [];
  const pagination = res?.pagination;

  const reset = () => {
    setStatus("");
    setTableId("");
    setFrom("");
    setTo("");
    setPage(1);
  };
  const onFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn</h1>
        <p className="text-sm text-gray-500">Xử lý đơn theo vòng đời: xác nhận → chế biến → hoàn tất</p>
      </div>

      {/* Bộ lọc */}
      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Select label="Trạng thái" value={status} onChange={(e) => onFilter(setStatus)(e.target.value)}>
          <option value="">Tất cả</option>
          {Object.entries(ORDER_STATUS_CONFIG).map(([v, cfg]) => (
            <option key={v} value={v}>{cfg.label}</option>
          ))}
        </Select>
        <Select label="Bàn" value={tableId} onChange={(e) => onFilter(setTableId)(e.target.value)}>
          <option value="">Tất cả bàn</option>
          {tables.map((t) => (
            <option key={t._id} value={t._id}>Bàn {t.tableNumber}</option>
          ))}
        </Select>
        <Input label="Từ ngày" type="date" value={from} onChange={(e) => onFilter(setFrom)(e.target.value)} />
        <Input label="Đến ngày" type="date" value={to} onChange={(e) => onFilter(setTo)(e.target.value)} />
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Đặt lại
          </Button>
        </div>
      </Card>

      {/* Bảng đơn */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Không tải được danh sách đơn" description="Vui lòng thử lại sau." />
      ) : orders.length === 0 ? (
        <EmptyState title="Không có đơn nào" description="Chưa có đơn khớp bộ lọc hiện tại." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="px-4 py-3 font-medium">Mã đơn</th>
                <th className="px-4 py-3 font-medium">Thời gian</th>
                <th className="px-4 py-3 font-medium">Bàn</th>
                <th className="px-4 py-3 font-medium">Tổng tiền</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Thanh toán</th>
                <th className="px-4 py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${o._id}`} className="font-medium text-primary hover:underline">
                      {o.orderCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">Bàn {o.tableNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{formatVND(o.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} type="order" /></td>
                  <td className="px-4 py-3"><StatusPill status={o.paymentStatus} type="payment" /></td>
                  <td className="px-4 py-3"><OrderActions order={o} variant="row" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
      )}
    </div>
  );
}
