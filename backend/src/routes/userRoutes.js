import { Router } from "express";
import {
  getMe,
  updateMe,
  listUsers,
  updateUserStatus,
} from "../controllers/userController.js";
import { updateProfileRules, updateStatusRules } from "../validators/userValidator.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/rbac.js";

const router = Router();

// Hồ sơ cá nhân 🔒
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfileRules, validate, updateMe);

// Quản lý người dùng 👮 Admin
router.get("/", authenticate, requireAdmin, listUsers);
router.patch("/:id/status", authenticate, requireAdmin, updateStatusRules, validate, updateUserStatus);

export default router;
