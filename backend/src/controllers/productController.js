import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/response.js";
import * as productService from "../services/productService.js";

// Chuyển "true"/"false" trong query string thành boolean (undefined nếu không truyền)
const toBool = (v) => (v === undefined ? undefined : v === "true" || v === true);

// GET /api/products (công khai) — lọc + tìm kiếm + phân trang
export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { categoryId, search, sort } = req.query;

  const { data, total } = await productService.listProducts({
    page,
    limit,
    categoryId,
    search,
    sort,
    isAvailable: toBool(req.query.isAvailable),
    isFeatured: toBool(req.query.isFeatured),
  });

  sendPaginated(res, data, { page, limit, total });
});

// GET /api/products/:id (công khai)
export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, product);
});

// POST /api/products 👮
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  sendCreated(res, product, "Tạo món thành công");
});

// PUT /api/products/:id 👮
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product, "Cập nhật món thành công");
});

// DELETE /api/products/:id 👮 (ẩn món)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  sendSuccess(res, product, "Đã ẩn món (isAvailable=false)");
});
