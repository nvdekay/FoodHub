import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { generateUniqueSlug } from "../utils/slugify.js";

/**
 * FR-MENU-01 — Danh sách danh mục.
 * Mặc định chỉ danh mục đang hoạt động, sắp theo displayOrder.
 * all=true (cho trang quản trị) → trả cả danh mục đã ẩn.
 */
export const listCategories = async ({ all = false } = {}) => {
  const filter = all ? {} : { isActive: true };
  return Category.find(filter).sort({ displayOrder: 1, createdAt: 1 });
};

/** FR-MENU-02 — Tạo danh mục (slug tự sinh, name duy nhất). */
export const createCategory = async ({ name, description, imageUrl, displayOrder, isActive }) => {
  const slug = await generateUniqueSlug(Category, name);
  return Category.create({ name, slug, description, imageUrl, displayOrder, isActive });
};

/** FR-MENU-02 — Cập nhật danh mục (đổi name → sinh lại slug). */
export const updateCategory = async (id, payload) => {
  const cat = await Category.findById(id);
  if (!cat) throw ApiError.notFound("Không tìm thấy danh mục");

  const { name, description, imageUrl, displayOrder, isActive } = payload;
  if (name !== undefined && name !== cat.name) {
    cat.name = name;
    cat.slug = await generateUniqueSlug(Category, name, cat._id);
  }
  if (description !== undefined) cat.description = description;
  if (imageUrl !== undefined) cat.imageUrl = imageUrl;
  if (displayOrder !== undefined) cat.displayOrder = displayOrder;
  if (isActive !== undefined) cat.isActive = isActive;

  await cat.save();
  return cat;
};

/**
 * FR-MENU-02 — Xoá danh mục.
 * Còn món → soft delete (isActive=false) để giữ toàn vẹn lịch sử.
 * Không còn món → xoá cứng.
 */
export const deleteCategory = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) throw ApiError.notFound("Không tìm thấy danh mục");

  const productCount = await Product.countDocuments({ categoryId: id });
  if (productCount > 0) {
    cat.isActive = false;
    await cat.save();
    return { softDeleted: true, productCount };
  }

  await cat.deleteOne();
  return { softDeleted: false, productCount: 0 };
};
