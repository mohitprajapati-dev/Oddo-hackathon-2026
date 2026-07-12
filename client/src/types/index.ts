// Vehicle Types
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type VehicleType = 'Truck' | 'Van' | 'Bus' | 'Sedan' | 'SUV';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleName: string;
  vehicleType: VehicleType;
  capacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
}

// Driver Types
export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
export type LicenseCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Driver {
  id: string;
  driverName: string;
  licenseNumber: string;
  category: LicenseCategory;
  licenseExpiry: string;
  contact: string;
  tripCompletion: number;
  safetyScore: number;
  status: DriverStatus;
  avatar?: string;
}

// Trip Types
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  tripId: string;
  source: string;
  destination: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  cargoWeight: number;
  distance: number;
  status: TripStatus;
  eta?: string;
  createdAt: string;
}

// Maintenance Types
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  service: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
}

// Fuel Types
export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  liters: number;
  cost: number;
}

// Expense Types
export interface Expense {
  id: string;
  tripId: string;
  vehicleId: string;
  vehicleName: string;
  toll: number;
  other: number;
  maintenance: number;
  total: number;
}

// Dashboard Types
export interface KPIData {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

export interface VehicleStatusBreakdown {
  available: number;
  onTrip: number;
  inShop: number;
  retired: number;
  total: number;
}

// Analytics Types
export interface AnalyticsKPI {
  fuelEfficiency: number;
  fleetUtilization: number;
  operationalCost: number;
  vehicleROI: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  cost: number;
}

export interface CostliestVehicle {
  vehicleName: string;
  totalCost: number;
}

export interface FuelEfficiencyData {
  month: string;
  efficiency: number;
}

export interface OperationalCostData {
  month: string;
  fuel: number;
  maintenance: number;
  toll: number;
  other: number;
}

// Settings Types
export type Permission = 'full' | 'view' | 'edit' | 'none';

export interface RBACRole {
  role: string;
  fleet: Permission;
  drivers: Permission;
  trips: Permission;
  maintenance: Permission;
  fuel: Permission;
  analytics: Permission;
  settings: Permission;
}

export interface GeneralSettings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

// Navigation
export interface NavItem {
  label: string;
  path: string;
  icon: string;
}
