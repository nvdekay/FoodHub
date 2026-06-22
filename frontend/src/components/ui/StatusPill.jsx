import Badge from "./Badge";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  TABLE_STATUS_CONFIG,
} from "../../lib/statusConfig";

const MAPS = {
  order: ORDER_STATUS_CONFIG,
  payment: PAYMENT_STATUS_CONFIG,
  table: TABLE_STATUS_CONFIG,
};

/** type: "order" | "payment" | "table" */
export default function StatusPill({ status, type = "order" }) {
  const cfg = MAPS[type]?.[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}
