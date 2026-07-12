import * as tripService from "./trip.service.js";
import * as vehicleService from "../vehicle/vehicle.service.js";
import * as driverService from "../driver/driver.service.js";

export const createTrip = async (req, res, next) => {
  try {
    const { vehicle_id, driver_id, cargo_weight_kg, route_details, source, destination, planned_distance } = req.body;

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

    if (vehicle.status === "Retired") {
      return res.status(400).json({
        success: false,
        message: "Retired vehicles cannot be dispatched.",
      });
    }

    if (vehicle.status === "In Shop") {
      return res.status(400).json({
        success: false,
        message: "Vehicles in maintenance cannot be dispatched.",
      });
    }

    if (vehicle.status === "On Trip") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already assigned to another active trip.",
      });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Vehicle is not available. Current status: ${vehicle.status}`,
      });
    }

    // Cargo weight validation against vehicle max load capacity
    if (parsedWeight > Number(vehicle.max_load_capacity)) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${parsedWeight} kg) exceeds vehicle maximum load capacity (${vehicle.max_load_capacity} kg).`,
      });
    }

    const driver = await driverService.getDriverDetailsById(driver_id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    // License expiry check
    if (driver.license_expiry) {
      const expiryDate = new Date(driver.license_expiry);
      if (expiryDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: `Driver's license has expired on ${driver.license_expiry}. Cannot assign to trip.`,
        });
      }
    }

    if (driver.status === "Suspended") {
      return res.status(400).json({
        success: false,
        message: "Suspended drivers cannot be assigned to trips.",
      });
    }

    if (driver.status === "On Trip" || driver.status === "Active") {
      return res.status(400).json({
        success: false,
        message: "Driver is already assigned to another active trip.",
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
      source: source || null,
      destination: destination || null,
      planned_distance: planned_distance ? Number(planned_distance) : null,
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
      nextDriverStatus = "On Trip";
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
      if (status === "Completed" && trip.planned_distance) {
        const vehicle = await vehicleService.getVehicleById(trip.vehicle_id);
        const currentOdometer = vehicle?.odometer ? Number(vehicle.odometer) : 0;
        await vehicleService.updateVehicle(trip.vehicle_id, { 
          status: nextVehicleStatus,
          odometer: currentOdometer + Number(trip.planned_distance)
        });
      } else {
        await vehicleService.updateVehicle(trip.vehicle_id, { status: nextVehicleStatus });
      }
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
    const { id, role } = req.user;
    const filters = {};

    if (role === "Driver") {
      // Driver sees only their own trips
      filters.driver_id = id;

    } else if (role === "Fleet Manager") {
      // Fetch both owned vehicles and owned drivers in parallel
      const [myVehicles, myDrivers] = await Promise.all([
        vehicleService.getVehicleByOwner(id),
        (async () => {
          const { supabase } = await import("../../utils/supabase.js");
          const { data, error } = await supabase
            .from("drivers")
            .select("id")
            .eq("owner_id", id);
          if (error) throw error;
          return data || [];
        })(),
      ]);

      filters.vehicle_ids = myVehicles.map((v) => v.id);
      filters.driver_ids = myDrivers.map((d) => d.id);

      // Optional query-param overrides
      const { driver_id, vehicle_id } = req.query;
      if (driver_id) filters.driver_id = driver_id;
      if (vehicle_id) filters.vehicle_id = vehicle_id;

    } else {
      // Other roles: allow optional query params, no forced scoping
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
