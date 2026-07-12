import * as dashboardService from "./dashboard.service.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    let data;

    if (role === "Fleet Manager") {
      data = await dashboardService.getFleetManagerSummary(id);
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
