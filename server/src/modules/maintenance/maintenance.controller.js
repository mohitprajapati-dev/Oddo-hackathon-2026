import maintenanceService from "./maintenance.service.js";

class MaintenanceController {
  async createMaintenance(req, res, next) {
    try {
      const { vehicle_id, description, start_date, cost } = req.body;

      if (!vehicle_id || !description) {
        return res.status(400).json({
          success: false,
          message: "vehicle_id and description are required.",
        });
      }

      const parsedCost = cost !== undefined ? Number(cost) : 0;
      if (isNaN(parsedCost) || parsedCost < 0) {
        return res.status(400).json({
          success: false,
          message: "cost must be a positive number.",
        });
      }

      const newLog = await maintenanceService.createMaintenance({
        vehicle_id,
        description,
        start_date,
        cost: parsedCost,
      });

      return res.status(201).json({
        success: true,
        message: "Maintenance record created successfully.",
        data: newLog,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMaintenanceList(req, res, next) {
    try {
      const { vehicle_id, status } = req.query;
      const filters = {};
      if (vehicle_id) filters.vehicle_id = vehicle_id;
      if (status) filters.status = status;

      const list = await maintenanceService.getMaintenanceList(filters);
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMaintenanceDetails(req, res, next) {
    try {
      const { id } = req.params;
      const log = await maintenanceService.getMaintenanceById(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          message: "Maintenance log not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMaintenance(req, res, next) {
    try {
      const { id } = req.params;
      const { description, start_date, cost, status } = req.body;

      const updates = {};
      if (description !== undefined) updates.description = description;
      if (start_date !== undefined) updates.start_date = start_date;
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
      if (status !== undefined) {
        const validStatuses = ["Active", "Completed"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `status must be one of: ${validStatuses.join(", ")}`,
          });
        }
        updates.status = status;
      }

      const updated = await maintenanceService.updateMaintenance(id, updates);
      return res.status(200).json({
        success: true,
        message: "Maintenance record updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeMaintenance(req, res, next) {
    try {
      const { id } = req.params;
      const { cost, end_date } = req.body;

      const parsedCost = cost !== undefined ? Number(cost) : 0;
      if (isNaN(parsedCost) || parsedCost < 0) {
        return res.status(400).json({
          success: false,
          message: "cost must be a positive number.",
        });
      }

      const completed = await maintenanceService.completeMaintenance(id, {
        cost: parsedCost,
        end_date,
      });

      return res.status(200).json({
        success: true,
        message: "Maintenance record completed successfully.",
        data: completed,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MaintenanceController();
