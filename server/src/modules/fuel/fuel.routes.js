import express from "express";
import fuelController from "./fuel.controller.js";
import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Listing fuel logs is visible to all authenticated roles
router.get("/", fuelController.listFuelLogs);

// Mutating logs restricted to Fleet Managers, Financial Analysts, and Drivers
router.post("/", authorize("Fleet Manager", "Financial Analyst", "Driver"), fuelController.addFuelLog);
router.put("/:id", authorize("Fleet Manager", "Financial Analyst", "Driver"), fuelController.updateFuelLog);
router.delete("/:id", authorize("Fleet Manager", "Financial Analyst"), fuelController.deleteFuelLog);

export default router;
