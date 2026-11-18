import { Router } from "express";
import {
  getStatusMonitor,
  getLeadTime,
} from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

router.get("/status-monitor", getStatusMonitor);
router.get("/lead-time", getLeadTime);

export default router;
