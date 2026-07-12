import express from "express";
import maintenanceController from "./maintenance.controller.js";
import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Read endpoints accessible to all authenticated users
router.get("/", maintenanceController.getMaintenanceList);
router.get("/:id", maintenanceController.getMaintenanceDetails);

// Mutating endpoints restricted to Fleet Managers and Safety Officers
router.post("/", authorize("Fleet Manager", "Safety Officer"), maintenanceController.createMaintenance);
router.put("/:id", authorize("Fleet Manager", "Safety Officer"), maintenanceController.updateMaintenance);
router.put("/:id/complete", authorize("Fleet Manager", "Safety Officer"), maintenanceController.completeMaintenance);

export default router;
