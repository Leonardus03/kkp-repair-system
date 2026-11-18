import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", verifyToken, requireRole("admin"), register);

export default router;
