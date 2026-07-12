// Vehicle Routes
import express from "express";
import * as vehicleController from "./vehicle.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",protect,vehicleController.fetchVehiclesByOnwer);
router.post("/new", protect, vehicleController.newVehicle);
router.post("/update-status",protect,vehicleController.updateVehicleStatus)
router.post("/update-odometer",protect,vehicleController.updateOdometer)
export default router;