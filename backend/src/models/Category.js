import mongoose from "mongoose";

/**
 * categories — Danh mục thực đơn (SRS 6.4.2).
 * Nhóm các món theo loại (Cà phê, Trà sữa...).
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    imageUrl: { type: String, default: null },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index phục vụ lọc & sắp xếp menu
categorySchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model("Category", categorySchema);
