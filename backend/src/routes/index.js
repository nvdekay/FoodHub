import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import tableRoutes from "./tableRoutes.js";

/**
 * Router gốc cho toàn bộ API (tiền tố /api).
 * Các module được mount dần qua từng phase:
 *   Phase 3: authRoutes, userRoutes ✓
 *   Phase 4: categoryRoutes, productRoutes ✓
 *   Phase 5: tableRoutes ✓
 *   Phase 6-7: orderRoutes
 *   Phase 8: dashboardRoutes
 */
const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "FoodHub API OK", data: { uptime: process.uptime() } });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/tables", tableRoutes);

// router.use("/orders", orderRoutes);
// router.use("/dashboard", dashboardRoutes);

export default router;
