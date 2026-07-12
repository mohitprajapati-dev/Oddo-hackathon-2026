import type { KPIData, VehicleStatusBreakdown } from '../types';

export const kpiData: KPIData = {
  activeVehicles: 10,
  availableVehicles: 5,
  vehiclesInMaintenance: 2,
  activeTrips: 4,
  pendingTrips: 2,
  driversOnDuty: 6,
  fleetUtilization: 73,
};

export const vehicleStatusBreakdown: VehicleStatusBreakdown = {
  available: 5,
  onTrip: 4,
  inShop: 2,
  retired: 1,
  total: 12,
};
