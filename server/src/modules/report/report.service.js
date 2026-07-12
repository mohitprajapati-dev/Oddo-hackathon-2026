import { supabase } from "../../utils/supabase.js";

class ReportService {
  /**
   * Fuel Efficiency Report
   * Calculates fuel consumption per vehicle: total liters, total cost, km/L efficiency
   */
  async getFuelEfficiencyReport(filters = {}) {
    // Fetch all vehicles
    let vehicleQuery = supabase.from("vehicles").select("id, registration_number, vehicle_name, vehicle_type, odometer");
    if (filters.vehicle_id) vehicleQuery = vehicleQuery.eq("id", filters.vehicle_id);
    if (filters.owner_id) vehicleQuery = vehicleQuery.eq("owner_id", filters.owner_id);
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0) {
      vehicleQuery = vehicleQuery.in("id", filters.vehicle_ids);
    }

    const { data: vehicles, error: vErr } = await vehicleQuery;
    if (vErr) throw vErr;
    if (!vehicles || vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id);

    // Fetch all fuel logs for these vehicles
    const { data: fuelLogs, error: fErr } = await supabase
      .from("fuel_logs")
      .select("vehicle_id, amount_liters, cost")
      .in("vehicle_id", vehicleIds);

    if (fErr) throw fErr;

    // Fetch completed trips for distance data
    const { data: trips, error: tErr } = await supabase
      .from("trips")
      .select("vehicle_id, planned_distance")
      .in("vehicle_id", vehicleIds)
      .eq("status", "Completed");

    if (tErr) throw tErr;

    // Aggregate per vehicle
    return vehicles.map((vehicle) => {
      const vehicleFuel = (fuelLogs || []).filter((f) => f.vehicle_id === vehicle.id);
      const vehicleTrips = (trips || []).filter((t) => t.vehicle_id === vehicle.id);
      const totalLiters = vehicleFuel.reduce((sum, f) => sum + Number(f.amount_liters), 0);
      const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + Number(f.cost), 0);
      const totalDistance = vehicleTrips.reduce((sum, t) => sum + Number(t.planned_distance || 0), 0);
      const efficiency = totalLiters > 0 ? Math.round((totalDistance / totalLiters) * 100) / 100 : 0;

      return {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        vehicle_name: vehicle.vehicle_name,
        vehicle_type: vehicle.vehicle_type,
        odometer: Number(vehicle.odometer),
        total_liters: Math.round(totalLiters * 100) / 100,
        total_fuel_cost: Math.round(totalFuelCost * 100) / 100,
        total_distance_km: Math.round(totalDistance * 100) / 100,
        fuel_efficiency_kmpl: efficiency,
        fuel_log_count: vehicleFuel.length,
      };
    });
  }

  /**
   * Fleet Utilization Report
   * Calculates % of vehicles on trip vs total for utilization metrics
   */
  async getFleetUtilizationReport(filters = {}) {
    let vehicleQuery = supabase.from("vehicles").select("id, registration_number, vehicle_name, vehicle_type, status");
    if (filters.owner_id) vehicleQuery = vehicleQuery.eq("owner_id", filters.owner_id);
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0) {
      vehicleQuery = vehicleQuery.in("id", filters.vehicle_ids);
    }

    const { data: vehicles, error: vErr } = await vehicleQuery;
    if (vErr) throw vErr;
    if (!vehicles || vehicles.length === 0) return { summary: {}, vehicles: [] };

    const vehicleIds = vehicles.map((v) => v.id);

    // Fetch all trips for these vehicles
    const { data: trips, error: tErr } = await supabase
      .from("trips")
      .select("vehicle_id, status, dispatched_at, completed_at, cancelled_at, created_at")
      .in("vehicle_id", vehicleIds);

    if (tErr) throw tErr;

    const totalVehicles = vehicles.length;
    const available = vehicles.filter((v) => v.status === "Available").length;
    const onTrip = vehicles.filter((v) => v.status === "On Trip").length;
    const inShop = vehicles.filter((v) => v.status === "In Shop").length;
    const retired = vehicles.filter((v) => v.status === "Retired").length;
    const utilizationRate = totalVehicles > 0 ? Math.round((onTrip / totalVehicles) * 100) : 0;

    // Per-vehicle trip counts
    const vehicleDetails = vehicles.map((vehicle) => {
      const vehicleTrips = (trips || []).filter((t) => t.vehicle_id === vehicle.id);
      const completedTrips = vehicleTrips.filter((t) => t.status === "Completed").length;
      const activeTrips = vehicleTrips.filter((t) => t.status === "Dispatched").length;
      const totalTrips = vehicleTrips.length;

      return {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        vehicle_name: vehicle.vehicle_name,
        vehicle_type: vehicle.vehicle_type,
        current_status: vehicle.status,
        total_trips: totalTrips,
        completed_trips: completedTrips,
        active_trips: activeTrips,
      };
    });

    return {
      summary: {
        total_vehicles: totalVehicles,
        available,
        on_trip: onTrip,
        in_shop: inShop,
        retired,
        utilization_rate_percent: utilizationRate,
      },
      vehicles: vehicleDetails,
    };
  }

  /**
   * Operational Cost Report
   * Aggregates costs by category (fuel, maintenance, toll, other) per vehicle
   */
  async getOperationalCostReport(filters = {}) {
    let vehicleQuery = supabase.from("vehicles").select("id, registration_number, vehicle_name, vehicle_type, acquisition_cost");
    if (filters.owner_id) vehicleQuery = vehicleQuery.eq("owner_id", filters.owner_id);
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0) {
      vehicleQuery = vehicleQuery.in("id", filters.vehicle_ids);
    }

    const { data: vehicles, error: vErr } = await vehicleQuery;
    if (vErr) throw vErr;
    if (!vehicles || vehicles.length === 0) return { summary: {}, vehicles: [] };

    const vehicleIds = vehicles.map((v) => v.id);

    // Fetch fuel logs
    const { data: fuelLogs, error: fErr } = await supabase
      .from("fuel_logs")
      .select("vehicle_id, cost")
      .in("vehicle_id", vehicleIds);
    if (fErr) throw fErr;

    // Fetch maintenance logs
    const { data: maintLogs, error: mErr } = await supabase
      .from("maintenance_logs")
      .select("vehicle_id, cost")
      .in("vehicle_id", vehicleIds);
    if (mErr) throw mErr;

    // Fetch other expenses (non fuel/maintenance to avoid double counting)
    const { data: otherExpenses, error: eErr } = await supabase
      .from("expenses")
      .select("vehicle_id, category, amount")
      .in("vehicle_id", vehicleIds)
      .not("category", "in", '("Fuel","Maintenance")');
    if (eErr) throw eErr;

    let totalFuelCost = 0;
    let totalMaintenanceCost = 0;
    let totalTollCost = 0;
    let totalOtherCost = 0;

    const vehicleDetails = vehicles.map((vehicle) => {
      const vFuel = (fuelLogs || []).filter((f) => f.vehicle_id === vehicle.id);
      const vMaint = (maintLogs || []).filter((m) => m.vehicle_id === vehicle.id);
      const vOther = (otherExpenses || []).filter((e) => e.vehicle_id === vehicle.id);

      const fuelCost = vFuel.reduce((sum, f) => sum + Number(f.cost), 0);
      const maintCost = vMaint.reduce((sum, m) => sum + Number(m.cost), 0);
      const tollCost = vOther.filter((e) => e.category === "Toll").reduce((sum, e) => sum + Number(e.amount), 0);
      const otherCost = vOther.filter((e) => e.category !== "Toll").reduce((sum, e) => sum + Number(e.amount), 0);
      const totalCost = fuelCost + maintCost + tollCost + otherCost;

      totalFuelCost += fuelCost;
      totalMaintenanceCost += maintCost;
      totalTollCost += tollCost;
      totalOtherCost += otherCost;

      return {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        vehicle_name: vehicle.vehicle_name,
        vehicle_type: vehicle.vehicle_type,
        fuel_cost: Math.round(fuelCost * 100) / 100,
        maintenance_cost: Math.round(maintCost * 100) / 100,
        toll_cost: Math.round(tollCost * 100) / 100,
        other_cost: Math.round(otherCost * 100) / 100,
        total_operational_cost: Math.round(totalCost * 100) / 100,
      };
    });

    return {
      summary: {
        total_fuel_cost: Math.round(totalFuelCost * 100) / 100,
        total_maintenance_cost: Math.round(totalMaintenanceCost * 100) / 100,
        total_toll_cost: Math.round(totalTollCost * 100) / 100,
        total_other_cost: Math.round(totalOtherCost * 100) / 100,
        grand_total: Math.round((totalFuelCost + totalMaintenanceCost + totalTollCost + totalOtherCost) * 100) / 100,
      },
      vehicles: vehicleDetails,
    };
  }

  /**
   * Vehicle ROI Report
   * Calculates total cost (acquisition + operational) per vehicle
   */
  async getVehicleROIReport(filters = {}) {
    let vehicleQuery = supabase.from("vehicles").select("id, registration_number, vehicle_name, vehicle_type, acquisition_cost, odometer, status, created_at");
    if (filters.owner_id) vehicleQuery = vehicleQuery.eq("owner_id", filters.owner_id);
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0) {
      vehicleQuery = vehicleQuery.in("id", filters.vehicle_ids);
    }

    const { data: vehicles, error: vErr } = await vehicleQuery;
    if (vErr) throw vErr;
    if (!vehicles || vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id);

    // Get operational costs
    const [fuelRes, maintRes, expenseRes, tripRes] = await Promise.all([
      supabase.from("fuel_logs").select("vehicle_id, cost").in("vehicle_id", vehicleIds),
      supabase.from("maintenance_logs").select("vehicle_id, cost").in("vehicle_id", vehicleIds),
      supabase.from("expenses").select("vehicle_id, amount").in("vehicle_id", vehicleIds).not("category", "in", '("Fuel","Maintenance")'),
      supabase.from("trips").select("vehicle_id, status").in("vehicle_id", vehicleIds),
    ]);

    if (fuelRes.error) throw fuelRes.error;
    if (maintRes.error) throw maintRes.error;
    if (expenseRes.error) throw expenseRes.error;
    if (tripRes.error) throw tripRes.error;

    return vehicles.map((vehicle) => {
      const fuelCost = (fuelRes.data || [])
        .filter((f) => f.vehicle_id === vehicle.id)
        .reduce((sum, f) => sum + Number(f.cost), 0);
      const maintCost = (maintRes.data || [])
        .filter((m) => m.vehicle_id === vehicle.id)
        .reduce((sum, m) => sum + Number(m.cost), 0);
      const otherCost = (expenseRes.data || [])
        .filter((e) => e.vehicle_id === vehicle.id)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      
      const completedTrips = (tripRes.data || [])
        .filter((t) => t.vehicle_id === vehicle.id && t.status === "Completed").length;
      const totalTrips = (tripRes.data || [])
        .filter((t) => t.vehicle_id === vehicle.id).length;

      const acquisitionCost = Number(vehicle.acquisition_cost);
      const operationalCost = fuelCost + maintCost + otherCost;
      const totalCost = acquisitionCost + operationalCost;

      // Calculate months since acquisition
      const monthsSinceAcquisition = Math.max(1, 
        Math.ceil((Date.now() - new Date(vehicle.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
      );
      const costPerMonth = Math.round((totalCost / monthsSinceAcquisition) * 100) / 100;
      const costPerTrip = completedTrips > 0 ? Math.round((operationalCost / completedTrips) * 100) / 100 : 0;

      return {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        vehicle_name: vehicle.vehicle_name,
        vehicle_type: vehicle.vehicle_type,
        current_status: vehicle.status,
        acquisition_cost: acquisitionCost,
        operational_cost: Math.round(operationalCost * 100) / 100,
        total_cost: Math.round(totalCost * 100) / 100,
        total_trips: totalTrips,
        completed_trips: completedTrips,
        odometer: Number(vehicle.odometer),
        months_since_acquisition: monthsSinceAcquisition,
        cost_per_month: costPerMonth,
        cost_per_trip: costPerTrip,
      };
    });
  }
}

export default new ReportService();
