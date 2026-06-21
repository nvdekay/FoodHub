import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import * as categoryService from "../services/categoryService.js";

// GET /api/categories (công khai). ?all=true để lấy cả danh mục ẩn.
export const listCategories = asyncHandler(async (req, res) => {
  const all = req.query.all === "true";
  const data = await categoryService.listCategories({ all });
  sendSuccess(res, data);
});

// POST /api/categories 👮
export const createCategory = asyncHandler(async (req, res) => {
  const cat = await categoryService.createCategory(req.body);
  sendCreated(res, cat, "Tạo danh mục thành công");
});

// PUT /api/categories/:id 👮
export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, cat, "Cập nhật danh mục thành công");
});

// DELETE /api/categories/:id 👮
export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  const message = result.softDeleted
    ? `Danh mục còn ${result.productCount} món nên đã được ẩn (isActive=false)`
    : "Đã xoá danh mục";
  sendSuccess(res, result, message);
});
