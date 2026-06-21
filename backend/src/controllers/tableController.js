import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import * as tableService from "../services/tableService.js";

const toBool = (v) => (v === undefined ? undefined : v === "true" || v === true);

// GET /api/tables 🔒
export const listTables = asyncHandler(async (req, res) => {
  const data = await tableService.listTables({
    status: req.query.status,
    isActive: toBool(req.query.isActive),
  });
  sendSuccess(res, data);
});

// POST /api/tables 👮
export const createTable = asyncHandler(async (req, res) => {
  const table = await tableService.createTable(req.body);
  sendCreated(res, table, "Tạo bàn thành công");
});

// PUT /api/tables/:id 👮
export const updateTable = asyncHandler(async (req, res) => {
  const table = await tableService.updateTable(req.params.id, req.body);
  sendSuccess(res, table, "Cập nhật bàn thành công");
});

// DELETE /api/tables/:id 👮
export const deleteTable = asyncHandler(async (req, res) => {
  const table = await tableService.deleteTable(req.params.id);
  sendSuccess(res, table, "Đã ẩn bàn (isActive=false)");
});
