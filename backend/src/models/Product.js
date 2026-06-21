import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Một lựa chọn trong nhóm tuỳ chọn. VD: { label: "Size L", priceModifier: 5000 }.
 */
const choiceSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    priceModifier: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/**
 * Một nhóm tuỳ chọn (nhúng trong product). VD: nhóm "Size", "Topping".
 */
const optionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["single", "multiple"], required: true },
    required: { type: Boolean, default: false },
    choices: { type: [choiceSchema], default: [] },
  },
  { _id: false }
);

/**
 * products — Món ăn / đồ uống (SRS 6.4.3).
 * Thuộc 1 danh mục (ref categoryId); các tuỳ chọn được NHÚNG.
 */
const productSchema = new Schema(
  {
    name: { type: String, required: [true, "Tên món là bắt buộc"], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc"],
      index: true,
    },
    basePrice: { type: Number, required: [true, "Giá gốc là bắt buộc"], min: 0 },
    imageUrl: { type: String, default: null },
    options: { type: [optionSchema], default: [] },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    preparationTime: { type: Number, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Index: lọc theo trạng thái còn bán; tìm kiếm theo tên (text)
productSchema.index({ isAvailable: 1 });
productSchema.index({ name: "text" });

export default mongoose.model("Product", productSchema);
