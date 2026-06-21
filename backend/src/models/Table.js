import mongoose from "mongoose";

/**
 * tables — Bàn trong cửa hàng (SRS 6.4.4).
 * Mỗi đơn gắn với 1 bàn. Trạng thái occupied/available được hệ thống tự đồng bộ.
 */
const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, "Số bàn là bắt buộc"],
      unique: true,
      trim: true,
    },
    capacity: { type: Number, min: 1 },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available",
      index: true,
    },
    qrCodeUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);
