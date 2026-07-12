// Driver Routes
import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import * as driverController from "./driver.controller.js";

const router = express.Router();

router.post("/update-details", protect, driverController.updateDriverDetails);
router.get("/search", protect, driverController.searchDriverByEmail);
router.post("/add", protect, driverController.addDriver);

export default router;