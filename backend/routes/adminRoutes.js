import { Router } from "express";
import {
  getReadyToReturn,
  markAsReturned,
} from "../controllers/adminController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken, requireRole("admin"));

router.get("/ready-to-return", getReadyToReturn);
router.post("/:partId/mark-returned", markAsReturned);

export default router;
