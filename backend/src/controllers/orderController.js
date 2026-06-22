import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/response.js";
import * as orderService from "../services/orderService.js";

// POST /api/orders 🔒
export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req, req.body);
  sendCreated(res, order, "Tạo đơn thành công");
});

// GET /api/orders/my 🔒
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { status } = req.query;

  const { data, total } = await orderService.getMyOrders(req.user.userId, { page, limit, status });
  sendPaginated(res, data, { page, limit, total });
});

// GET /api/orders/:id 🔒 (chủ đơn hoặc staff/admin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req, req.params.id);
  sendSuccess(res, order);
});

// PUT /api/orders/:id 🔒 (chủ đơn, pending)
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req, req.params.id, req.body);
  sendSuccess(res, order, "Cập nhật đơn thành công");
});

// DELETE /api/orders/:id 🔒 (chủ đơn tự huỷ, pending)
export const cancelOwnOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOwnOrder(req, req.params.id);
  sendSuccess(res, order, "Đã huỷ đơn");
});

/* ===================== Phía nhân viên (👮) ===================== */

// GET /api/orders 👮
export const listAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { status, tableId, from, to } = req.query;

  const { data, total } = await orderService.listAllOrders({ page, limit, status, tableId, from, to });
  sendPaginated(res, data, { page, limit, total });
});

// PATCH /api/orders/:id/confirm 👮
export const confirmOrder = asyncHandler(async (req, res) => {
  const order = await orderService.confirmOrder(req, req.params.id, {
    discountAmount: req.body.discountAmount,
  });
  sendSuccess(res, order, "Đã xác nhận đơn");
});

// PATCH /api/orders/:id/status 👮
export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req, req.params.id, req.body.status);
  sendSuccess(res, order, "Đã cập nhật trạng thái đơn");
});

// PATCH /api/orders/:id/cancel 👮
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrderByStaff(req, req.params.id, req.body.cancelReason);
  sendSuccess(res, order, "Đã huỷ đơn");
});

// PATCH /api/orders/:id/payment 👮
export const updatePayment = asyncHandler(async (req, res) => {
  const order = await orderService.updatePayment(req, req.params.id, req.body);
  sendSuccess(res, order, "Đã cập nhật thanh toán");
});
