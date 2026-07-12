import * as dashboardService from "./dashboard.service.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const { vehicle_type, vehicle_status, region } = req.query;
    const filters = {};
    if (vehicle_type) filters.vehicle_type = vehicle_type;
    if (vehicle_status) filters.vehicle_status = vehicle_status;
    if (region) filters.region = region;

    let data;
    if (role === "Fleet Manager") {
      data = await dashboardService.getFleetManagerSummary(id, filters);
    } else if (role === "Driver") {
      data = await dashboardService.getDriverSummary(id);
    } else if (role === "Safety Officer") {
      data = await dashboardService.getSafetyOfficerSummary();
    } else if (role === "Financial Analyst") {
      data = await dashboardService.getFinancialAnalystSummary();
    } else {
      return res.status(403).json({
        success: false,
        message: `No dashboard configured for role: ${role}`,
      });
    }

    return res.status(200).json({ success: true, role, data });
  } catch (err) {
    next(err);
  }
};
