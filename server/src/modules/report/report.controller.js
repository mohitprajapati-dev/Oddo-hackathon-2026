import reportService from "./report.service.js";
import { getAllowedVehicleIds } from "../../utils/authUtils.js";

/**
 * Convert an array of objects to CSV string
 */
function toCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      // Escape quotes and wrap in quotes if contains comma/newline/quote
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Send response as JSON or CSV based on query param
 */
function sendReport(res, data, filename) {
  const format = res.req.query.format;
  if (format === "csv") {
    const csvData = Array.isArray(data) ? data : data.vehicles || [];
    const csv = toCSV(csvData);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
    return res.send(csv);
  }
  return res.status(200).json({ success: true, data });
}

async function getFilters(req) {
  const filters = {};
  const { vehicle_id } = req.query;
  if (vehicle_id) filters.vehicle_id = vehicle_id;
  filters.vehicle_ids = await getAllowedVehicleIds(req.user);
  return filters;
}

class ReportController {
  async getFuelEfficiency(req, res, next) {
    try {
      const filters = await getFilters(req);
      const data = await reportService.getFuelEfficiencyReport(filters);
      return sendReport(res, data, "fuel_efficiency_report");
    } catch (error) {
      next(error);
    }
  }

  async getFleetUtilization(req, res, next) {
    try {
      const filters = await getFilters(req);
      const data = await reportService.getFleetUtilizationReport(filters);
      return sendReport(res, data, "fleet_utilization_report");
    } catch (error) {
      next(error);
    }
  }

  async getOperationalCost(req, res, next) {
    try {
      const filters = await getFilters(req);
      const data = await reportService.getOperationalCostReport(filters);
      return sendReport(res, data, "operational_cost_report");
    } catch (error) {
      next(error);
    }
  }

  async getVehicleROI(req, res, next) {
    try {
      const filters = await getFilters(req);
      const data = await reportService.getVehicleROIReport(filters);
      return sendReport(res, data, "vehicle_roi_report");
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
