export const profileUser = {
  firstName: 'Arjun',
  lastName: 'Mehta',
  email: 'arjun.mehta@transitops.in',
  phone: '+91 98765 43210',
  address: '42, MG Road, Bengaluru, Karnataka – 560001',
  joiningDate: '14 March 2021',
  role: 'Dispatcher',
  department: 'Operations',
  employeeId: 'EMP-2021-0347',
  officeLocation: 'Bengaluru HQ',
  reportingManager: 'Priya Sharma',
  employmentType: 'Full-Time',
  avatarInitials: 'AM',
};

export const notificationPreferences = [
  { id: 'email', label: 'Email Notifications', description: 'Receive updates via email', enabled: true },
  { id: 'sms', label: 'SMS Notifications', description: 'Get alerts via text message', enabled: false },
  { id: 'trip', label: 'Trip Alerts', description: 'Notified on trip status changes', enabled: true },
  { id: 'maintenance', label: 'Maintenance Alerts', description: 'Alerts for vehicle maintenance', enabled: true },
  { id: 'weekly', label: 'Weekly Reports', description: 'Weekly fleet performance digest', enabled: false },
];

export const activitySummary = {
  tripsManaged: 248,
  vehiclesAssigned: 34,
  completedTasks: 312,
  performanceScore: '96%',
};

export interface ActivityEntry {
  id: string;
  activity: string;
  date: string;
  status: string;
}

export const recentActivity: ActivityEntry[] = [
  { id: '1', activity: 'Dispatched Trip #TRP-2089 to Route 7B', date: '12 Jul 2026, 11:32 AM', status: 'Completed' },
  { id: '2', activity: 'Updated vehicle MH-12-AB-5678 service record', date: '12 Jul 2026, 10:15 AM', status: 'Completed' },
  { id: '3', activity: 'Assigned Driver Ravi Kumar to Trip #TRP-2087', date: '12 Jul 2026, 09:44 AM', status: 'In Progress' },
  { id: '4', activity: 'Scheduled maintenance for KA-09-CD-3412', date: '11 Jul 2026, 04:20 PM', status: 'Scheduled' },
  { id: '5', activity: 'Generated monthly fuel expense report', date: '11 Jul 2026, 02:05 PM', status: 'Completed' },
  { id: '6', activity: 'Reviewed and approved driver log for 8 drivers', date: '10 Jul 2026, 05:00 PM', status: 'Completed' },
  { id: '7', activity: 'Resolved vehicle breakdown alert – TN-22-EF-7812', date: '10 Jul 2026, 01:30 PM', status: 'Completed' },
];

export const securityInfo = {
  lastLogin: '12 Jul 2026, 11:28 AM',
  browser: 'Chrome 126 on Windows 11',
  device: 'HP EliteBook 840 G10',
};
