import fuelService from "./fuel.service.js";

class FuelController {
  async addFuelLog(req, res, next) {
    try {
      const { vehicle_id, trip_id, amount_liters, cost, logged_at, notes } = req.body;

      if (!vehicle_id || amount_liters === undefined || cost === undefined) {
        return res.status(400).json({
          success: false,
          message: "vehicle_id, amount_liters, and cost are required.",
        });
      }

      const parsedLiters = Number(amount_liters);
      if (isNaN(parsedLiters) || parsedLiters <= 0) {
        return res.status(400).json({
          success: false,
          message: "amount_liters must be a positive number.",
        });
      }

      const parsedCost = Number(cost);
      if (isNaN(parsedCost) || parsedCost < 0) {
        return res.status(400).json({
          success: false,
          message: "cost must be a positive number.",
        });
      }

      const newLog = await fuelService.addFuelLog({
        vehicle_id,
        trip_id: trip_id || null,
        amount_liters: parsedLiters,
        cost: parsedCost,
        logged_at,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: "Fuel log added successfully.",
        data: newLog,
      });
    } catch (error) {
      next(error);
    }
  }

  async listFuelLogs(req, res, next) {
    try {
      const { vehicle_id, trip_id } = req.query;
      const filters = {};
      if (vehicle_id) filters.vehicle_id = vehicle_id;
      if (trip_id) filters.trip_id = trip_id;

      const logs = await fuelService.getFuelLogs(filters);
      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFuelLog(req, res, next) {
    try {
      const { id } = req.params;
      const { amount_liters, cost, notes } = req.body;

      const updates = {};
      if (amount_liters !== undefined) {
        const parsedLiters = Number(amount_liters);
        if (isNaN(parsedLiters) || parsedLiters <= 0) {
          return res.status(400).json({
            success: false,
            message: "amount_liters must be a positive number.",
          });
        }
        updates.amount_liters = parsedLiters;
      }
      if (cost !== undefined) {
        const parsedCost = Number(cost);
        if (isNaN(parsedCost) || parsedCost < 0) {
          return res.status(400).json({
            success: false,
            message: "cost must be a positive number.",
          });
        }
        updates.cost = parsedCost;
      }
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const updated = await fuelService.updateFuelLog(id, updates);
      return res.status(200).json({
        success: true,
        message: "Fuel log updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFuelLog(req, res, next) {
    try {
      const { id } = req.params;
      await fuelService.deleteFuelLog(id);
      return res.status(200).json({
        success: true,
        message: "Fuel log deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FuelController();
