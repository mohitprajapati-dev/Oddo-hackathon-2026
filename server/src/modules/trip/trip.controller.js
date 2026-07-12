import * as tripService from "./trip.service.js";
import * as vehicleService from "../vehicle/vehicle.service.js";
import * as driverService from "../driver/driver.service.js";

export const createTrip = async (req, res, next) => {
  try {
    const { vehicle_id, driver_id, cargo_weight_kg, route_details } = req.body;

    if (!vehicle_id || !driver_id || cargo_weight_kg === undefined) {
      return res.status(400).json({
        success: false,
        message: "vehicle_id, driver_id, and cargo_weight_kg are required.",
      });
    }

    const parsedWeight = Number(cargo_weight_kg);
    if (isNaN(parsedWeight) || parsedWeight < 0) {
      return res.status(400).json({
        success: false,
        message: "cargo_weight_kg must be a positive number.",
      });
    }

    const vehicle = await vehicleService.getVehicleById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Vehicle is not available. Current status: ${vehicle.status}`,
      });
    }

    const driver = await driverService.getDriverDetailsById(driver_id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    if (driver.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Driver is not available. Current status: ${driver.status}`,
      });
    }

    const tripData = {
      vehicle_id,
      driver_id,
      cargo_weight_kg: parsedWeight,
      route_details: route_details || null,
      status: "Pending",
    };

    const newTrip = await tripService.createTrip(tripData);

    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: newTrip,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTripStatus = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Dispatched", "Completed", "Cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`,
      });
    }

    const trip = await tripService.getTripById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const updateData = { status };
    let nextVehicleStatus = null;
    let nextDriverStatus = null;

    if (status === "Dispatched") {
      updateData.dispatched_at = new Date().toISOString();
      nextVehicleStatus = "On Trip";
      nextDriverStatus = "Active";
    } else if (status === "Completed") {
      updateData.completed_at = new Date().toISOString();
      nextVehicleStatus = "Available";
      nextDriverStatus = "Available";
    } else if (status === "Cancelled") {
      updateData.cancelled_at = new Date().toISOString();
      nextVehicleStatus = "Available";
      nextDriverStatus = "Available";
    }

    const updatedTrip = await tripService.updateTrip(tripId, updateData);

    if (nextVehicleStatus) {
      await vehicleService.updateVehicle(trip.vehicle_id, { status: nextVehicleStatus });
    }

    if (nextDriverStatus) {
      await driverService.updateDriver(trip.driver_id, { status: nextDriverStatus });
    }

    return res.status(200).json({
      success: true,
      message: `Trip status updated to ${status} successfully`,
      data: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchTrips = async (req, res, next) => {
  try {
    let filters = {};

    if (req.user.role === "Driver") {
      filters.driver_id = req.user.id;
    } else {
      const { driver_id, vehicle_id } = req.query;
      if (driver_id) filters.driver_id = driver_id;
      if (vehicle_id) filters.vehicle_id = vehicle_id;
    }

    const trips = await tripService.getTrips(filters);

    return res.status(200).json({
      success: true,
      message: "Trips fetched successfully",
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};
