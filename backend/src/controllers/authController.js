import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import * as authService from "../services/authService.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  const result = await authService.register({ fullName, email, phone, password });
  sendCreated(res, result, "Đăng ký thành công");
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  sendSuccess(res, result, "Đăng nhập thành công");
});
