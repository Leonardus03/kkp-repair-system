import { Router } from "express";
import { getShiftReport } from "../controllers/sectionHeadController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken, requireRole("section_head", "admin"));

router.get("/shift-report", getShiftReport);

export default router;
