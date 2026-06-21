import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrder,
  cancelOwnOrder,
} from "../controllers/orderController.js";
import { createOrderRules, updateOrderRules } from "../validators/orderValidator.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// ===== Phía khách (🔒) =====
router.post("/", authenticate, createOrderRules, validate, createOrder);
router.get("/my", authenticate, getMyOrders); // phải đặt TRƯỚC /:id
router.get("/:id", authenticate, getOrder);
router.put("/:id", authenticate, updateOrderRules, validate, updateOrder);
router.delete("/:id", authenticate, cancelOwnOrder);

// ===== Phía nhân viên (👮) — bổ sung ở Phase 7 =====

export default router;
