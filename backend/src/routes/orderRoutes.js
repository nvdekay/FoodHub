import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrder,
  cancelOwnOrder,
  listAllOrders,
  confirmOrder,
  updateStatus,
  cancelOrder,
  updatePayment,
} from "../controllers/orderController.js";
import {
  createOrderRules,
  updateOrderRules,
  confirmOrderRules,
  updateStatusRules,
  cancelOrderRules,
  paymentRules,
} from "../validators/orderValidator.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { requireStaff } from "../middlewares/rbac.js";

const router = Router();

// ===== Phía nhân viên (👮) — đặt route tĩnh TRƯỚC /:id =====
router.get("/", authenticate, requireStaff, listAllOrders);

// ===== Phía khách (🔒) =====
router.post("/", authenticate, createOrderRules, validate, createOrder);
router.get("/my", authenticate, getMyOrders); // phải đặt TRƯỚC /:id
router.get("/:id", authenticate, getOrder);
router.put("/:id", authenticate, updateOrderRules, validate, updateOrder);
router.delete("/:id", authenticate, cancelOwnOrder);

// ===== Phía nhân viên (👮) — thao tác trên đơn =====
router.patch("/:id/confirm", authenticate, requireStaff, confirmOrderRules, validate, confirmOrder);
router.patch("/:id/status", authenticate, requireStaff, updateStatusRules, validate, updateStatus);
router.patch("/:id/cancel", authenticate, requireStaff, cancelOrderRules, validate, cancelOrder);
router.patch("/:id/payment", authenticate, requireStaff, paymentRules, validate, updatePayment);

export default router;
