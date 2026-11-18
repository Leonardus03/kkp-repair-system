import { Router } from "express";
import { getMyTasks, startRepair, submitRepairLog } from "../controllers/repairController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken, requireRole("mp_repair"));

// Tahap 2: Task List MP
router.get("/tasks", getMyTasks);
// Scan barcode -> mulai kerjakan
router.post("/:partId/start", startRepair);
// Isi digital log (keparahan, tindakan)
router.put("/logs/:logId", submitRepairLog);

export default router;
