import Table from "../models/Table.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

// Đơn còn đang phục vụ (dùng để khoá việc xoá bàn & đồng bộ trạng thái ở Phase 6)
export const ACTIVE_ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready"];

/** FR-TBL-01/02 — Danh sách bàn, lọc theo status / isActive. */
export const listTables = async ({ status, isActive } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (isActive !== undefined) filter.isActive = isActive;
  return Table.find(filter).sort({ tableNumber: 1 });
};

/** FR-TBL-01 — Tạo bàn (tableNumber duy nhất). */
export const createTable = async ({ tableNumber, capacity, status, qrCodeUrl, isActive }) => {
  return Table.create({ tableNumber, capacity, status, qrCodeUrl, isActive });
};

/** FR-TBL-01/02 — Cập nhật bàn. Nhân viên đặt/bỏ 'reserved' thủ công qua đây. */
export const updateTable = async (id, payload) => {
  const table = await Table.findById(id);
  if (!table) throw ApiError.notFound("Không tìm thấy bàn");

  const { tableNumber, capacity, status, qrCodeUrl, isActive } = payload;
  if (tableNumber !== undefined) table.tableNumber = tableNumber;
  if (capacity !== undefined) table.capacity = capacity;
  if (status !== undefined) table.status = status;
  if (qrCodeUrl !== undefined) table.qrCodeUrl = qrCodeUrl;
  if (isActive !== undefined) table.isActive = isActive;

  await table.save();
  return table;
};

/**
 * FR-TBL-01 — Xoá bàn.
 * Chặn nếu bàn còn đơn đang phục vụ (TABLE_HAS_ACTIVE_ORDERS).
 * Ngược lại soft delete (isActive=false) để giữ tham chiếu lịch sử đơn.
 */
export const deleteTable = async (id) => {
  const table = await Table.findById(id);
  if (!table) throw ApiError.notFound("Không tìm thấy bàn");

  const activeCount = await Order.countDocuments({
    tableId: id,
    status: { $in: ACTIVE_ORDER_STATUSES },
  });
  if (activeCount > 0) {
    throw ApiError.conflict(
      `Bàn còn ${activeCount} đơn đang phục vụ, không thể xoá`,
      "TABLE_HAS_ACTIVE_ORDERS"
    );
  }

  table.isActive = false;
  await table.save();
  return table;
};

/**
 * Đồng bộ trạng thái bàn theo reference-counting (quyết định #1).
 * occupied khi còn ≥1 đơn active trên bàn; available khi hết.
 * KHÔNG động vào bàn đang 'reserved' (nhân viên đặt thủ công).
 * Gọi sau khi tạo/đổi trạng thái/huỷ đơn.
 */
export const syncTableStatus = async (tableId) => {
  if (!tableId) return;
  const table = await Table.findById(tableId);
  if (!table || table.status === "reserved") return;

  const activeCount = await Order.countDocuments({
    tableId,
    status: { $in: ACTIVE_ORDER_STATUSES },
  });
  const newStatus = activeCount > 0 ? "occupied" : "available";

  if (table.status !== newStatus) {
    table.status = newStatus;
    await table.save();
  }
};
