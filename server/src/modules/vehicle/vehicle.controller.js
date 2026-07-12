import * as vehicleService from "./vehicle.service.js";


export const fetchVehiclesByOnwer = async (req, res, next) => {
  try {
    const owner_id = req.user.id;
    const vehicles = await vehicleService.getVehicleByOwner(owner_id);
    return res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};
export const newVehicle=async(req, res, next)=>{
    try {
      const {
        registration_number,
        vehicle_name,
        vehicle_type,
        max_load_capacity,
        odometer,
        acquisition_cost,
        status,
        region,
      } = req.body;

      if (
        !registration_number ||
        !vehicle_name ||
        !vehicle_type ||
        max_load_capacity === undefined ||
        acquisition_cost === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "registration_number, vehicle_name, vehicle_type, max_load_capacity, and acquisition_cost are required.",
        });
      }
      const parsedMaxLoad = Number(max_load_capacity);
      if (isNaN(parsedMaxLoad) || parsedMaxLoad <= 0) {
        return res.status(400).json({
          success: false,
          message: "max_load_capacity must be a positive number.",
        });
      }

      const parsedOdometer = odometer !== undefined ? Number(odometer) : 0;
      if (isNaN(parsedOdometer) || parsedOdometer < 0) {
        return res.status(400).json({
          success: false,
          message: "odometer must be greater than or equal to 0.",
        });
      }

      const parsedAcquisitionCost = Number(acquisition_cost);
      if (isNaN(parsedAcquisitionCost) || parsedAcquisitionCost < 0) {
        return res.status(400).json({
          success: false,
          message: "acquisition_cost must be greater than or equal to 0.",
        });
      }

      const validStatuses = ["Available", "On Trip", "In Shop", "Retired"];
      const finalStatus = status || "Available";
      if (!validStatuses.includes(finalStatus)) {
        return res.status(400).json({
          success: false,
          message: `status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const existingVehicle = await vehicleService.getVehicleByRegistrationNumber(
        registration_number
      );
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle with this registration number already exists.",
        });
      }

      const vehicleData = {
        registration_number,
        vehicle_name,
        vehicle_type,
        max_load_capacity: parsedMaxLoad,
        odometer: parsedOdometer,
        acquisition_cost: parsedAcquisitionCost,
        status: finalStatus,
        region: region || null,
        owner_id: req.user.id,
      };

      const newVehicle = await vehicleService.createVehicle(vehicleData);

      return res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: newVehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  export const updateVehicleStatus=async(req,res,next)=>{
    try {
        const {vehicleId,status}=req.body;
        const validStatuses = ["Available", "On Trip", "In Shop", "Retired"];
      const finalStatus = status || "Available";
      if (!validStatuses.includes(finalStatus)) {
        return res.status(400).json({
          success: false,
          message: `status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const vehicle = await vehicleService.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle not found.",
        });
      }
      const updatedVehicle = await vehicleService.updateVehicle(vehicleId, {
        status: finalStatus,
      });
      return res.status(200).json({
        success: true,
        message: "Vehicle status updated successfully",
        data: updatedVehicle,
      });
    } catch (error) {
        next(error);
    }
  }

export const updateOdometer=async(req,res,next)=>{
    try {
        const {vehicleId,odometer}=req.body;
        const vehicle = await vehicleService.getVehicleById(vehicleId);
        if (!vehicle) {
            return res.status(400).json({
            success: false,
            message: "Vehicle not found.",
            });
        }
        const updatedVehicle = await vehicleService.updateVehicle(vehicleId, {
            odometer: odometer,
        });
        return res.status(200).json({
            success: true,
            message: "Odometer updated successfully",
            data: updatedVehicle,
        });
    } catch (error) {
        next(error);
    }
}

