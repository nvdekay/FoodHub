import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { basePrice: 1 },
  price_desc: { basePrice: -1 },
  popular: { soldCount: -1 },
};

// Các field được phép gán khi tạo/sửa món
const EDITABLE = [
  "name",
  "description",
  "categoryId",
  "basePrice",
  "imageUrl",
  "options",
  "isAvailable",
  "isFeatured",
  "preparationTime",
];

const pick = (obj) =>
  EDITABLE.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

const ensureCategory = async (categoryId) => {
  const cat = await Category.findById(categoryId);
  if (!cat) throw ApiError.badRequest("Danh mục không tồn tại", "CATEGORY_NOT_FOUND");
  return cat;
};

/** FR-MENU-03 — Danh sách món: lọc danh mục, tìm theo tên, lọc còn bán, phân trang, sắp xếp. */
export const listProducts = async ({
  page,
  limit,
  categoryId,
  search,
  isAvailable,
  isFeatured,
  sort,
}) => {
  const filter = {};
  if (categoryId) filter.categoryId = categoryId;
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
  if (isAvailable !== undefined) filter.isAvailable = isAvailable;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured;

  const sortOpt = SORT_MAP[sort] || SORT_MAP.newest;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "name slug")
      .sort(sortOpt)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { data, total };
};

/** FR-MENU-04 — Chi tiết món. */
export const getProductById = async (id) => {
  const product = await Product.findById(id).populate("categoryId", "name slug");
  if (!product) throw ApiError.notFound("Không tìm thấy món");
  return product;
};

/** FR-MENU-05 — Thêm món (slug tự sinh, kiểm tra danh mục tồn tại). */
export const createProduct = async (payload) => {
  await ensureCategory(payload.categoryId);
  const data = pick(payload);
  data.slug = await generateUniqueSlug(Product, data.name);
  return Product.create(data);
};

/** FR-MENU-06 — Sửa món (đổi giá KHÔNG ảnh hưởng đơn cũ nhờ snapshot ở Order). */
export const updateProduct = async (id, payload) => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Không tìm thấy món");

  if (payload.categoryId !== undefined) await ensureCategory(payload.categoryId);

  const data = pick(payload);
  Object.assign(product, data);
  if (data.name !== undefined) {
    product.slug = await generateUniqueSlug(Product, data.name, product._id);
  }

  await product.save();
  return product;
};

/** FR-MENU-07 — Ẩn món (soft delete) thay vì xoá cứng để giữ lịch sử đơn. */
export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Không tìm thấy món");
  product.isAvailable = false;
  await product.save();
  return product;
};
