import { Router } from "express";
import {
  listTables,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/tableController.js";
import { createTableRules, updateTableRules } from "../validators/tableValidator.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { requireStaff } from "../middlewares/rbac.js";

const router = Router();

// 🔒 Mọi người dùng đã đăng nhập đều xem được danh sách bàn (để chọn bàn khi đặt)
router.get("/", authenticate, listTables);

// 👮 Nhân viên / quản trị
router.post("/", authenticate, requireStaff, createTableRules, validate, createTable);
router.put("/:id", authenticate, requireStaff, updateTableRules, validate, updateTable);
router.delete("/:id", authenticate, requireStaff, deleteTable);

export default router;
