import { supabase } from "../../utils/supabase.js";

/**
 * Fleet Manager: all vehicles, drivers, and trips they own/manage
 */
export const getFleetManagerSummary = async (userId) => {
  // Step 1: fetch vehicles and drivers owned by this manager
  const [vehiclesRes, driversRes] = await Promise.all([
    supabase.from("vehicles").select("*").eq("owner_id", userId),
    supabase.from("drivers").select("*").eq("owner_id", userId),
  ]);

  if (vehiclesRes.error) throw vehiclesRes.error;
  if (driversRes.error) throw driversRes.error;

  const vehicles = vehiclesRes.data || [];
  const drivers = driversRes.data || [];

  // Step 2: fetch trips only for vehicles this manager owns
  const vehicleIds = vehicles.map((v) => v.id);
  let trips = [];

  if (vehicleIds.length > 0) {
    const { data: tripsData, error: tripsError } = await supabase
      .from("trips")
      .select("*, vehicles:vehicle_id(registration_number, vehicle_type), drivers:driver_id(name, email)")
      .in("vehicle_id", vehicleIds)
      .order("created_at", { ascending: false })
      .limit(10);

    if (tripsError) throw tripsError;
    trips = tripsData || [];
  }

  // Compute KPIs
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const onTripVehicles = vehicles.filter((v) => v.status === "On Trip").length;
  const inShopVehicles = vehicles.filter((v) => v.status === "In Shop").length;
  const retiredVehicles = vehicles.filter((v) => v.status === "Retired").length;
  const activeTrips = trips.filter((t) => t.status === "In Progress").length;
  const pendingTrips = trips.filter((t) => t.status === "Scheduled").length;
  const driversOnDuty = drivers.filter((d) => d.status === "On Duty").length;
  const fleetUtilization = totalVehicles > 0 ? Math.round((onTripVehicles / totalVehicles) * 100) : 0;

  return {
    kpis: {
      totalVehicles,
      availableVehicles,
      onTripVehicles,
      inShopVehicles,
      retiredVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization,
    },
    recentTrips: trips,
    vehicles,
    drivers,
  };
};


/**
 * Driver: only their own trips
 */
export const getDriverSummary = async (userId) => {
  const [driverRes, tripsRes] = await Promise.all([
    supabase.from("drivers").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("trips")
      .select("*, vehicles:vehicle_id(registration_number, vehicle_type)")
      .eq("driver_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (driverRes.error) throw driverRes.error;
  if (tripsRes.error) throw tripsRes.error;

  const trips = tripsRes.data || [];
  const totalTrips = trips.length;
  const completedTrips = trips.filter((t) => t.status === "Completed").length;
  const activeTrips = trips.filter((t) => t.status === "In Progress").length;
  const scheduledTrips = trips.filter((t) => t.status === "Scheduled").length;

  return {
    profile: driverRes.data,
    kpis: { totalTrips, completedTrips, activeTrips, scheduledTrips },
    trips,
  };
};

/**
 * Safety Officer: all drivers with compliance details
 */
export const getSafetyOfficerSummary = async () => {
  const [driversRes, tripsRes] = await Promise.all([
    supabase.from("drivers").select("*"),
    supabase
      .from("trips")
      .select("driver_id, status")
      .in("status", ["In Progress", "Scheduled"]),
  ]);

  if (driversRes.error) throw driversRes.error;
  if (tripsRes.error) throw tripsRes.error;

  const drivers = driversRes.data || [];
  const trips = tripsRes.data || [];

  const activeDriverIds = new Set(trips.map((t) => t.driver_id));
  const totalDrivers = drivers.length;
  const activeDrivers = activeDriverIds.size;
  const licenseExpiringSoon = drivers.filter((d) => {
    if (!d.license_expiry) return false;
    const expiry = new Date(d.license_expiry);
    const now = new Date();
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  return {
    kpis: { totalDrivers, activeDrivers, licenseExpiringSoon },
    drivers,
  };
};

/**
 * Financial Analyst: fuel logs and expenses
 */
export const getFinancialAnalystSummary = async () => {
  const [fuelRes, expensesRes] = await Promise.all([
    supabase
      .from("fuel_logs")
      .select("*, vehicles:vehicle_id(registration_number)")
      .order("logged_at", { ascending: false })
      .limit(20),
    supabase
      .from("expenses")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(20),
  ]);

  if (fuelRes.error) throw fuelRes.error;
  if (expensesRes.error) throw expensesRes.error;

  const fuelLogs = fuelRes.data || [];
  const expenses = expensesRes.data || [];

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
  const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + (f.amount_liters || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Group expenses by category
  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return {
    kpis: { totalFuelCost, totalFuelLiters, totalExpenses },
    expenseByCategory,
    fuelLogs,
    expenses,
  };
};
