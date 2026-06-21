import mongoose from "mongoose";

/**
 * Bộ đếm sinh số thứ tự tự tăng (atomic) cho orderCode (SRS 6.4.6).
 * Mỗi ngày một document, vd: { _id: "order-20260621", seq: 7 }.
 */
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // vd: "order-20260621"
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export default mongoose.model("Counter", counterSchema);
