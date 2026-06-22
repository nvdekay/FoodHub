import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as dashboardService from "../services/dashboardService.js";

// GET /api/dashboard/summary 👮
export const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  sendSuccess(res, data);
});

// GET /api/dashboard/top-products 👮
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const data = await dashboardService.getTopProducts({ limit });
  sendSuccess(res, data);
});
