import { Router } from "express";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { createCategoryRules, updateCategoryRules } from "../validators/categoryValidator.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { requireStaff } from "../middlewares/rbac.js";

const router = Router();

// Công khai
router.get("/", listCategories);

// 👮 Nhân viên / quản trị
router.post("/", authenticate, requireStaff, createCategoryRules, validate, createCategory);
router.put("/:id", authenticate, requireStaff, updateCategoryRules, validate, updateCategory);
router.delete("/:id", authenticate, requireStaff, deleteCategory);

export default router;
