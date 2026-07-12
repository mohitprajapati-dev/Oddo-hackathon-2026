import express from "express";
import * as tripController from "./trip.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, tripController.createTrip);
router.post("/:tripId/status", protect, tripController.updateTripStatus);
router.get("/", protect, tripController.fetchTrips);

export default router;
