import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { createProductRules, updateProductRules } from "../validators/productValidator.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { requireStaff } from "../middlewares/rbac.js";

const router = Router();

// Công khai
router.get("/", listProducts);
router.get("/:id", getProduct);

// 👮 Nhân viên / quản trị
router.post("/", authenticate, requireStaff, createProductRules, validate, createProduct);
router.put("/:id", authenticate, requireStaff, updateProductRules, validate, updateProduct);
router.delete("/:id", authenticate, requireStaff, deleteProduct);

export default router;
