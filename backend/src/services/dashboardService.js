import Order from "../models/Order.js";

const ALL_STATUSES = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

/**
 * FR-DASH-01 — Thống kê tổng quan.
 * - Số đơn theo trạng thái (đếm trên tất cả đơn).
 * - Doanh thu = Σ totalAmount đơn 'completed', gom theo completedAt (#8): hôm nay & tuần này.
 * - Số đơn tạo hôm nay (theo createdAt).
 */
export const getSummary = async () => {
  const statusAgg = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const ordersByStatus = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0]));
  statusAgg.forEach((s) => {
    if (s._id in ordersByStatus) ordersByStatus[s._id] = s.count;
  });
  const totalOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = now.getDay(); // 0 = Chủ nhật
  const diffToMonday = dow === 0 ? 6 : dow - 1;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);

  const revenueSince = async (since) => {
    const res = await Order.aggregate([
      { $match: { status: "completed", completedAt: { $gte: since } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    return res[0] || { revenue: 0, count: 0 };
  };

  const today = await revenueSince(startOfToday);
  const week = await revenueSince(startOfWeek);
  const ordersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

  return {
    ordersByStatus,
    totalOrders,
    ordersToday,
    revenueToday: today.revenue,
    completedToday: today.count,
    revenueWeek: week.revenue,
    completedWeek: week.count,
  };
};

/**
 * FR-DASH-02 — Món bán chạy.
 * Nguồn chân lý (#12): aggregate tổng số lượng từ items của các đơn 'completed'.
 */
export const getTopProducts = async ({ limit = 10 } = {}) => {
  const res = await Order.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.name" },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.itemTotal" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
  ]);

  return res.map((r) => ({
    productId: r._id,
    name: r.name,
    totalQuantity: r.totalQuantity,
    totalRevenue: r.totalRevenue,
  }));
};
