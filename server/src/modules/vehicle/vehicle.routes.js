// Vehicle Routes
import express from "express";
import vehicleController from "./vehicle.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",protect,vehicleController.fetchVehiclesByOnwer);
router.post("/new", protect, vehicleController.newVehicle);

export default router;