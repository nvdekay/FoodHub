import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { registerRules, loginRules } from "../validators/authValidator.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

export default router;
