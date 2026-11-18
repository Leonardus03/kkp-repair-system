import { Router } from "express";
import { getFullReport } from "../controllers/leaderController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken, requireRole("leader", "admin", "section_head"));

router.get("/full-report", getFullReport);

export default router;
