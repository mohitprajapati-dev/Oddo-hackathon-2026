import type { MaintenanceLog } from '../types';

export const maintenanceLogs: MaintenanceLog[] = [
  { id: 'm1', vehicleId: 'v4', vehicleName: 'Eicher Pro 2049', service: 'Engine Oil Change', cost: 8500, date: '2024-12-01', status: 'In Progress' },
  { id: 'm2', vehicleId: 'v10', vehicleName: 'Tata Winger', service: 'Brake Pad Replacement', cost: 12000, date: '2024-11-28', status: 'In Progress' },
  { id: 'm3', vehicleId: 'v2', vehicleName: 'Ashok Leyland Dost', service: 'Tire Rotation & Alignment', cost: 6500, date: '2024-11-25', status: 'Completed' },
  { id: 'm4', vehicleId: 'v5', vehicleName: 'BharatBenz 1217C', service: 'AC Service & Regas', cost: 4500, date: '2024-11-20', status: 'Completed' },
  { id: 'm5', vehicleId: 'v7', vehicleName: 'Force Traveller', service: 'Transmission Overhaul', cost: 35000, date: '2024-12-05', status: 'Scheduled' },
  { id: 'm6', vehicleId: 'v1', vehicleName: 'Tata Ace Gold', service: 'Battery Replacement', cost: 7800, date: '2024-12-03', status: 'Scheduled' },
  { id: 'm7', vehicleId: 'v11', vehicleName: 'Ashok Leyland Boss', service: 'Full Body Inspection', cost: 15000, date: '2024-11-15', status: 'Completed' },
  { id: 'm8', vehicleId: 'v3', vehicleName: 'Mahindra Bolero Pickup', service: 'Clutch Plate Replacement', cost: 18500, date: '2024-11-10', status: 'Completed' },
  { id: 'm9', vehicleId: 'v6', vehicleName: 'Tata Ultra T7', service: 'Coolant Flush', cost: 3200, date: '2024-12-08', status: 'Scheduled' },
  { id: 'm10', vehicleId: 'v9', vehicleName: 'Toyota Innova Crysta', service: 'Suspension Repair', cost: 22000, date: '2024-10-30', status: 'Overdue' },
];
