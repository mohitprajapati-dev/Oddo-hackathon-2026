import express from "express";
import reportController from "./report.controller.js";
import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// All report endpoints accessible to Fleet Manager, Financial Analyst, Safety Officer
const allowedRoles = authorize("Fleet Manager", "Financial Analyst", "Safety Officer");

router.get("/fuel-efficiency", allowedRoles, reportController.getFuelEfficiency);
router.get("/fleet-utilization", allowedRoles, reportController.getFleetUtilization);
router.get("/operational-cost", allowedRoles, reportController.getOperationalCost);
router.get("/vehicle-roi", allowedRoles, reportController.getVehicleROI);

export default router;
