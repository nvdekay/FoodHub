import { Router } from "express";
import { getSummary, getTopProducts } from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/auth.js";
import { requireStaff } from "../middlewares/rbac.js";

const router = Router();

// 👮 Nhân viên / quản trị
router.get("/summary", authenticate, requireStaff, getSummary);
router.get("/top-products", authenticate, requireStaff, getTopProducts);

export default router;
