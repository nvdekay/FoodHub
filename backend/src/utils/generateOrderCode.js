import Counter from "../models/Counter.js";

const pad = (n, len = 2) => String(n).padStart(len, "0");

/**
 * Sinh orderCode duy nhất, an toàn khi tải cao (SRS 6.4.6).
 * Dùng Counter.findOneAndUpdate + $inc (atomic), mỗi ngày một bộ đếm.
 * => ORD-YYYYMMDD-0007
 */
export const generateOrderCode = async () => {
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const key = `order-${yyyymmdd}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `ORD-${yyyymmdd}-${pad(counter.seq, 4)}`;
};
