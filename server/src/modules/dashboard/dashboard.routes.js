import { Router } from "express";
import { getDashboardSummary } from "./dashboard.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

// GET /api/dashboard/summary  →  role-filtered data
router.get("/summary", protect, getDashboardSummary);

export default router;
