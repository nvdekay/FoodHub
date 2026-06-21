import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Table from "../models/Table.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { generateOrderCode } from "../utils/generateOrderCode.js";
import * as tableService from "./tableService.js";

/* ===================== Hàm dùng chung ===================== */

/**
 * Dựng danh sách dòng món với SNAPSHOT + tính tiền ở BACKEND (không tin client).
 * - Chặn món đã ẩn / danh mục đã ẩn (PRODUCT_UNAVAILABLE).
 * - Validate selectedOptions: group required bắt buộc, single chọn đúng 1,
 *   choice phải thuộc nhóm; priceModifier LẤY TỪ DB.
 */
export const buildOrderItems = async (items) => {
  const built = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = await Product.findById(item.productId).populate("categoryId", "isActive");
    if (!product) {
      throw ApiError.badRequest(`Món ở dòng ${i + 1} không tồn tại`, "PRODUCT_NOT_FOUND");
    }
    if (!product.isAvailable) {
      throw ApiError.conflict(`Món '${product.name}' hiện không còn bán`, "PRODUCT_UNAVAILABLE");
    }
    if (product.categoryId && product.categoryId.isActive === false) {
      throw ApiError.conflict(`Danh mục của món '${product.name}' đã ẩn`, "PRODUCT_UNAVAILABLE");
    }

    const selected = item.selectedOptions || [];
    const validGroupNames = new Set(product.options.map((o) => o.name));

    // selectedOptions tham chiếu nhóm không tồn tại?
    for (const s of selected) {
      if (!validGroupNames.has(s.groupName)) {
        throw ApiError.badRequest(
          `Nhóm tuỳ chọn '${s.groupName}' không thuộc món '${product.name}'`,
          "OPTION_INVALID_GROUP"
        );
      }
    }

    // Duyệt theo định nghĩa nhóm để kiểm tra required/single và lấy priceModifier từ DB
    const resolvedOptions = [];
    for (const group of product.options) {
      const chosen = selected.filter((s) => s.groupName === group.name);
      if (group.required && chosen.length === 0) {
        throw ApiError.badRequest(`Món '${product.name}' cần chọn '${group.name}'`, "OPTION_REQUIRED");
      }
      if (group.type === "single" && chosen.length > 1) {
        throw ApiError.badRequest(`Nhóm '${group.name}' chỉ được chọn 1`, "OPTION_SINGLE_VIOLATION");
      }
      for (const c of chosen) {
        const choiceDef = group.choices.find((ch) => ch.label === c.choiceLabel);
        if (!choiceDef) {
          throw ApiError.badRequest(
            `Lựa chọn '${c.choiceLabel}' không thuộc nhóm '${group.name}'`,
            "OPTION_INVALID_CHOICE"
          );
        }
        resolvedOptions.push({
          groupName: group.name,
          choiceLabel: choiceDef.label,
          priceModifier: choiceDef.priceModifier, // lấy từ DB
        });
      }
    }

    const modifierSum = resolvedOptions.reduce((s, o) => s + (o.priceModifier || 0), 0);
    const unitPrice = product.basePrice;
    const itemTotal = (unitPrice + modifierSum) * item.quantity;

    built.push({
      productId: product._id,
      name: product.name, // snapshot
      unitPrice, // snapshot
      quantity: item.quantity,
      selectedOptions: resolvedOptions,
      itemTotal,
      note: item.note,
    });
  }

  return built;
};

/** Tính subtotal/totalAmount; kẹp discount trong [0, subtotal]. */
export const calcTotals = (items, discountAmount = 0) => {
  const subtotal = items.reduce((s, it) => s + it.itemTotal, 0);
  const discount = Math.min(Math.max(discountAmount || 0, 0), subtotal);
  return { subtotal, discountAmount: discount, totalAmount: subtotal - discount };
};

/** Xác định customerId: customer → chính mình; staff/admin → được đặt hộ (#7). */
export const resolveCustomer = async (req, bodyCustomerId) => {
  if (req.user.role === "customer") return req.user.userId;
  if (bodyCustomerId) {
    const exists = await User.findById(bodyCustomerId);
    if (!exists) throw ApiError.badRequest("Khách hàng không tồn tại", "CUSTOMER_NOT_FOUND");
    return exists._id;
  }
  return req.user.userId;
};

/* ===================== Nghiệp vụ phía khách ===================== */

/** FR-ORD-02 — Tạo đơn (status=pending). */
export const createOrder = async (req, body) => {
  const { tableId, items, note, customerId: bodyCustomerId } = body;

  const table = await Table.findById(tableId);
  if (!table) throw ApiError.badRequest("Bàn không tồn tại", "TABLE_INACTIVE");
  if (!table.isActive) throw ApiError.conflict("Bàn không khả dụng", "TABLE_INACTIVE");

  const customerId = await resolveCustomer(req, bodyCustomerId);
  const customer = await User.findById(customerId);
  if (!customer) throw ApiError.badRequest("Khách hàng không tồn tại", "CUSTOMER_NOT_FOUND");

  const builtItems = await buildOrderItems(items);
  const { subtotal, discountAmount, totalAmount } = calcTotals(builtItems, 0);
  const orderCode = await generateOrderCode();

  const order = await Order.create({
    orderCode,
    customerId,
    customerInfo: { fullName: customer.fullName, phone: customer.phone },
    tableId: table._id,
    tableNumber: table.tableNumber,
    items: builtItems,
    subtotal,
    discountAmount,
    totalAmount,
    status: "pending",
    note,
    statusHistory: [{ status: "pending", changedBy: req.user.userId, changedAt: new Date() }],
  });

  await tableService.syncTableStatus(table._id);
  return order;
};

/** FR-ORD-05 — Danh sách đơn của chính khách. */
export const getMyOrders = async (userId, { page, limit, status }) => {
  const filter = { customerId: userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  return { data, total };
};

/** FR-ORD-05 — Chi tiết đơn: chủ đơn hoặc staff/admin. */
export const getOrderById = async (req, id) => {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound("Không tìm thấy đơn");

  const isOwner = String(order.customerId) === String(req.user.userId);
  const isStaff = req.user.role === "staff" || req.user.role === "admin";
  if (!isOwner && !isStaff) throw ApiError.forbidden("Bạn không có quyền xem đơn này");

  return order;
};

/**
 * FR-ORD-03 — Sửa đơn: chỉ chủ đơn & khi pending.
 * Re-snapshot toàn bộ items theo giá hiện hành (#16); cập nhật atomic có điều kiện (#10).
 */
export const updateOrder = async (req, id, body) => {
  const existing = await Order.findById(id);
  if (!existing) throw ApiError.notFound("Không tìm thấy đơn");
  if (String(existing.customerId) !== String(req.user.userId)) {
    throw ApiError.forbidden("Bạn không có quyền sửa đơn này");
  }
  if (existing.status !== "pending") {
    throw ApiError.conflict("Đơn không còn ở trạng thái cho phép sửa", "ORDER_NOT_EDITABLE");
  }

  const update = {};
  if (body.items) {
    const builtItems = await buildOrderItems(body.items);
    const totals = calcTotals(builtItems, existing.discountAmount);
    update.items = builtItems;
    update.subtotal = totals.subtotal;
    update.discountAmount = totals.discountAmount;
    update.totalAmount = totals.totalAmount;
  }
  if (body.note !== undefined) update.note = body.note;

  let newTableId = null;
  if (body.tableId && String(body.tableId) !== String(existing.tableId)) {
    const table = await Table.findById(body.tableId);
    if (!table || !table.isActive) throw ApiError.conflict("Bàn không khả dụng", "TABLE_INACTIVE");
    update.tableId = table._id;
    update.tableNumber = table.tableNumber;
    newTableId = table._id;
  }

  // Atomic: chỉ cập nhật khi vẫn đúng chủ đơn & còn pending (#10)
  const order = await Order.findOneAndUpdate(
    { _id: id, customerId: req.user.userId, status: "pending" },
    { $set: update },
    { new: true, runValidators: true }
  );
  if (!order) {
    throw ApiError.conflict("Đơn vừa thay đổi trạng thái, không thể sửa", "ORDER_NOT_EDITABLE");
  }

  if (newTableId) {
    await tableService.syncTableStatus(existing.tableId);
    await tableService.syncTableStatus(newTableId);
  }
  return order;
};

/**
 * FR-ORD-04 — Khách tự huỷ đơn: chỉ chủ đơn & khi pending.
 * Chuyển status='cancelled' (giữ lịch sử), đồng bộ bàn. Atomic theo điều kiện (#10).
 */
export const cancelOwnOrder = async (req, id) => {
  const existing = await Order.findById(id);
  if (!existing) throw ApiError.notFound("Không tìm thấy đơn");
  if (String(existing.customerId) !== String(req.user.userId)) {
    throw ApiError.forbidden("Bạn không có quyền huỷ đơn này");
  }
  if (existing.status !== "pending") {
    throw ApiError.conflict("Đơn đã được xác nhận, không thể tự huỷ", "ORDER_NOT_EDITABLE");
  }

  const order = await Order.findOneAndUpdate(
    { _id: id, customerId: req.user.userId, status: "pending" },
    {
      $set: { status: "cancelled", cancelReason: "Khách tự huỷ" },
      $push: {
        statusHistory: {
          status: "cancelled",
          changedBy: req.user.userId,
          changedAt: new Date(),
          note: "Khách tự huỷ",
        },
      },
    },
    { new: true }
  );
  if (!order) {
    throw ApiError.conflict("Đơn vừa thay đổi trạng thái, không thể huỷ", "ORDER_NOT_EDITABLE");
  }

  await tableService.syncTableStatus(existing.tableId);
  return order;
};
