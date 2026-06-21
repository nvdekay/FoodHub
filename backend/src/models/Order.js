import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Một tuỳ chọn đã chọn của 1 món (snapshot). (SRS 6.4.5)
 */
const selectedOptionSchema = new Schema(
  {
    groupName: { type: String, required: true },
    choiceLabel: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * Một dòng món trong đơn — NHÚNG SNAPSHOT để bất biến với thay đổi menu.
 * Vẫn giữ productId để truy vết & cộng soldCount.
 */
const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot tên món lúc đặt
    unitPrice: { type: Number, required: true }, // snapshot giá gốc lúc đặt
    quantity: { type: Number, required: true, min: 1 },
    selectedOptions: { type: [selectedOptionSchema], default: [] },
    itemTotal: { type: Number, required: true }, // (unitPrice + Σ priceModifier) * quantity
    note: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Một bản ghi lịch sử trạng thái — NHÚNG.
 */
const statusLogSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      required: true,
    },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * orders — Đơn đặt món (SRS 6.4.5). Collection trọng tâm của hệ thống.
 */
const orderSchema = new Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
    },
    tableId: { type: Schema.Types.ObjectId, ref: "Table", required: true, index: true },
    tableNumber: { type: String, required: true }, // snapshot để hiển thị nhanh
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, "Đơn phải có ít nhất 1 món"],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "ewallet"],
      default: null,
    },
    note: { type: String, trim: true },
    cancelReason: { type: String, trim: true },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    statusHistory: { type: [statusLogSchema], default: [] },
  },
  { timestamps: true }
);

// Liệt kê đơn mới nhất trước
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
