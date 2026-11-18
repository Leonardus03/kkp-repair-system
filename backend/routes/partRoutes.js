import { Router } from "express";
import {
  createPart,
  getQueue,
  getPartDetail,
  getPendingSupply,
  markSupplied,
} from "../controllers/partController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

router.post("/", requireRole("pic_area"), createPart);
router.get(
  "/queue",
  requireRole("pic_area", "mp_repair", "section_head"),
  getQueue,
);
router.get("/pending-supply", requireRole("pic_area"), getPendingSupply);
router.post("/:id/mark-supplied", requireRole("pic_area"), markSupplied);
router.get("/:id", getPartDetail);

export default router;
