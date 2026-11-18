import { Router } from "express";
import {
  getPendingVerification,
  verifyPart,
} from "../controllers/qcController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken, requireRole("qc", "pic_area"));

router.get("/pending", getPendingVerification);
router.post("/:partId/verify", verifyPart);

export default router;
