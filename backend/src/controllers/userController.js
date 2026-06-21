import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import * as userService from "../services/userService.js";

// GET /api/users/me 🔒
export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.userId);
  sendSuccess(res, user);
});

// PUT /api/users/me 🔒
export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.userId, req.body);
  sendSuccess(res, user, "Cập nhật hồ sơ thành công");
});

// GET /api/users 👮 Admin
export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { role, search } = req.query;

  const { data, total } = await userService.listUsers({ page, limit, role, search });
  sendPaginated(res, data, { page, limit, total });
});

// PATCH /api/users/:id/status 👮 Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const user = await userService.updateUserStatus({
    targetId: req.params.id,
    actorId: req.user.userId,
    isActive,
    role,
  });
  sendSuccess(res, user, "Cập nhật tài khoản thành công");
});
