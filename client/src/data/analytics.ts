import type { AnalyticsKPI, MonthlyRevenue, CostliestVehicle, FuelEfficiencyData, OperationalCostData } from '../types';

export const analyticsKPI: AnalyticsKPI = {
  fuelEfficiency: 8.4,
  fleetUtilization: 73,
  operationalCost: 485000,
  vehicleROI: 18.5,
};

export const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 420000, cost: 310000 },
  { month: 'Feb', revenue: 380000, cost: 290000 },
  { month: 'Mar', revenue: 510000, cost: 350000 },
  { month: 'Apr', revenue: 470000, cost: 330000 },
  { month: 'May', revenue: 530000, cost: 370000 },
  { month: 'Jun', revenue: 490000, cost: 340000 },
  { month: 'Jul', revenue: 560000, cost: 390000 },
  { month: 'Aug', revenue: 520000, cost: 360000 },
  { month: 'Sep', revenue: 580000, cost: 400000 },
  { month: 'Oct', revenue: 610000, cost: 420000 },
  { month: 'Nov', revenue: 550000, cost: 380000 },
  { month: 'Dec', revenue: 640000, cost: 440000 },
];

export const costliestVehicles: CostliestVehicle[] = [
  { vehicleName: 'BharatBenz 1217C', totalCost: 185000 },
  { vehicleName: 'Ashok Leyland Boss', totalCost: 162000 },
  { vehicleName: 'Eicher Pro 2049', totalCost: 145000 },
  { vehicleName: 'Force Traveller', totalCost: 128000 },
  { vehicleName: 'Tata Ultra T7', totalCost: 112000 },
];

export const fuelEfficiencyData: FuelEfficiencyData[] = [
  { month: 'Jan', efficiency: 7.8 },
  { month: 'Feb', efficiency: 8.1 },
  { month: 'Mar', efficiency: 7.5 },
  { month: 'Apr', efficiency: 8.3 },
  { month: 'May', efficiency: 8.6 },
  { month: 'Jun', efficiency: 8.2 },
  { month: 'Jul', efficiency: 8.9 },
  { month: 'Aug', efficiency: 8.4 },
  { month: 'Sep', efficiency: 8.7 },
  { month: 'Oct', efficiency: 9.1 },
  { month: 'Nov', efficiency: 8.5 },
  { month: 'Dec', efficiency: 8.8 },
];

export const operationalCostData: OperationalCostData[] = [
  { month: 'Jan', fuel: 120000, maintenance: 85000, toll: 55000, other: 50000 },
  { month: 'Feb', fuel: 110000, maintenance: 78000, toll: 52000, other: 50000 },
  { month: 'Mar', fuel: 135000, maintenance: 92000, toll: 63000, other: 60000 },
  { month: 'Apr', fuel: 125000, maintenance: 80000, toll: 65000, other: 60000 },
  { month: 'May', fuel: 140000, maintenance: 95000, toll: 70000, other: 65000 },
  { month: 'Jun', fuel: 130000, maintenance: 82000, toll: 68000, other: 60000 },
  { month: 'Jul', fuel: 150000, maintenance: 98000, toll: 72000, other: 70000 },
  { month: 'Aug', fuel: 138000, maintenance: 88000, toll: 69000, other: 65000 },
  { month: 'Sep', fuel: 155000, maintenance: 100000, toll: 75000, other: 70000 },
  { month: 'Oct', fuel: 162000, maintenance: 105000, toll: 78000, other: 75000 },
  { month: 'Nov', fuel: 145000, maintenance: 90000, toll: 72000, other: 73000 },
  { month: 'Dec', fuel: 170000, maintenance: 110000, toll: 82000, other: 78000 },
];
