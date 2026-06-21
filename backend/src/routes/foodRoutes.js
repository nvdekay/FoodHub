import { Router } from "express";
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";

const router = Router();

router.route("/").get(getFoods).post(createFood);
router.route("/:id").get(getFoodById).put(updateFood).delete(deleteFood);

export default router;
