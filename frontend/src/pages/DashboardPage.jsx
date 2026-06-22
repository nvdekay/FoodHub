import { Wallet, CalendarRange, ShoppingBag, Clock } from "lucide-react";
import { Skeleton, EmptyState, Button } from "../components/ui";
import { useDashboardSummary, useTopProducts } from "../hooks/useDashboard";
import { formatVND } from "../lib/format";
import KpiCard from "../features/dashboard/KpiCard";
import OrdersByStatusChart from "../features/dashboard/OrdersByStatusChart";
import TopProductsTable from "../features/dashboard/TopProductsTable";

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useDashboardSummary();
  const { data: top = [], isLoading: topLoading } = useTopProducts(10);

  if (isError) {
    return (
      <EmptyState
        title="Không tải được dữ liệu"
        description="Vui lòng thử lại sau."
        action={<Button onClick={() => window.location.reload()}>Thử lại</Button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-sm text-gray-500">Số liệu kinh doanh cập nhật theo thời gian thực</p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : (
          <>
            <KpiCard
              icon={Wallet}
              label="Doanh thu hôm nay"
              value={formatVND(summary.revenueToday)}
              sub={`${summary.completedToday} đơn hoàn tất`}
              accent="green"
            />
            <KpiCard
              icon={CalendarRange}
              label="Doanh thu tuần này"
              value={formatVND(summary.revenueWeek)}
              sub={`${summary.completedWeek} đơn hoàn tất`}
              accent="primary"
            />
            <KpiCard
              icon={ShoppingBag}
              label="Đơn hôm nay"
              value={summary.ordersToday}
              sub={`Tổng ${summary.totalOrders} đơn`}
              accent="blue"
            />
            <KpiCard
              icon={Clock}
              label="Chờ xác nhận"
              value={summary.ordersByStatus.pending}
              sub="đơn cần xử lý"
              accent="amber"
            />
          </>
        )}
      </div>

      {/* Biểu đồ + top món */}
      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <OrdersByStatusChart data={summary.ordersByStatus} />
        )}
        {topLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <TopProductsTable data={top} />
        )}
      </div>
    </div>
  );
}
