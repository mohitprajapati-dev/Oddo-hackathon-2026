import type { RBACRole, GeneralSettings } from '../types';

export const generalSettings: GeneralSettings = {
  depotName: 'TransitOps Central Depot',
  currency: 'INR',
  distanceUnit: 'km',
};

export const rbacRoles: RBACRole[] = [
  { role: 'Fleet Manager', fleet: 'full', drivers: 'full', trips: 'full', maintenance: 'full', fuel: 'view', analytics: 'full', settings: 'edit' },
  { role: 'Dispatcher', fleet: 'view', drivers: 'view', trips: 'full', maintenance: 'none', fuel: 'none', analytics: 'view', settings: 'none' },
  { role: 'Safety Officer', fleet: 'view', drivers: 'full', trips: 'view', maintenance: 'view', fuel: 'none', analytics: 'view', settings: 'none' },
  { role: 'Financial Analyst', fleet: 'view', drivers: 'none', trips: 'view', maintenance: 'view', fuel: 'full', analytics: 'full', settings: 'none' },
];
