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
