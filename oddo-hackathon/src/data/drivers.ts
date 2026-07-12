import type { Driver } from '../types';

export const drivers: Driver[] = [
  { id: 'd1', driverName: 'Rajesh Kumar', licenseNumber: 'DL-0420110012345', category: 'C', licenseExpiry: '2027-03-15', contact: '+91 98765 43210', tripCompletion: 96, safetyScore: 92, status: 'On Trip' },
  { id: 'd2', driverName: 'Amit Sharma', licenseNumber: 'MH-0220130067890', category: 'D', licenseExpiry: '2026-11-20', contact: '+91 87654 32109', tripCompletion: 89, safetyScore: 88, status: 'Available' },
  { id: 'd3', driverName: 'Suresh Patel', licenseNumber: 'KA-0520140023456', category: 'C', licenseExpiry: '2027-06-30', contact: '+91 76543 21098', tripCompletion: 94, safetyScore: 95, status: 'On Trip' },
  { id: 'd4', driverName: 'Vikram Singh', licenseNumber: 'TN-0120150034567', category: 'E', licenseExpiry: '2026-09-10', contact: '+91 65432 10987', tripCompletion: 78, safetyScore: 72, status: 'Off Duty' },
  { id: 'd5', driverName: 'Mohammed Ali', licenseNumber: 'DL-0720160045678', category: 'D', licenseExpiry: '2028-01-25', contact: '+91 54321 09876', tripCompletion: 91, safetyScore: 90, status: 'Available' },
  { id: 'd6', driverName: 'Deepak Verma', licenseNumber: 'MH-1220170056789', category: 'C', licenseExpiry: '2027-08-14', contact: '+91 43210 98765', tripCompletion: 85, safetyScore: 82, status: 'On Trip' },
  { id: 'd7', driverName: 'Arun Nair', licenseNumber: 'KA-0120180067890', category: 'B', licenseExpiry: '2026-12-05', contact: '+91 32109 87654', tripCompletion: 92, safetyScore: 94, status: 'Available' },
  { id: 'd8', driverName: 'Prasad Reddy', licenseNumber: 'TN-0720190078901', category: 'D', licenseExpiry: '2027-04-18', contact: '+91 21098 76543', tripCompletion: 67, safetyScore: 58, status: 'Suspended' },
  { id: 'd9', driverName: 'Karthik Menon', licenseNumber: 'DL-0320200089012', category: 'C', licenseExpiry: '2028-07-22', contact: '+91 10987 65432', tripCompletion: 98, safetyScore: 97, status: 'On Trip' },
  { id: 'd10', driverName: 'Ravi Shankar', licenseNumber: 'MH-0420210090123', category: 'E', licenseExpiry: '2027-02-28', contact: '+91 09876 54321', tripCompletion: 82, safetyScore: 79, status: 'Off Duty' },
];
