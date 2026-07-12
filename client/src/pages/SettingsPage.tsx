import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { PageHeader, Card, Input, Select, Button, Badge } from '../components/common';
import { rbacRoles } from '../data/settings';
import type { Permission } from '../types';
import api from '../services/api';

function PermissionBadge({ permission }: { permission: Permission }) {
  const variants: Record<Permission, { variant: 'success' | 'info' | 'warning' | 'danger'; label: string }> = {
    full: { variant: 'success', label: 'Full Access' },
    view: { variant: 'info', label: 'View Only' },
    edit: { variant: 'warning', label: 'Edit' },
    none: { variant: 'danger', label: 'No Access' },
  };

  const { variant, label } = variants[permission];
  return <Badge variant={variant}>{label}</Badge>;
}

export function SettingsPage() {
  const [settings, setSettings] = useState({
    depotName: 'TransitOps Fleet',
    currency: 'INR',
    distanceUnit: 'km',
  });
  const [profileName, setProfileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load profile name on mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setProfileName(parsed.full_name || parsed.name || '');
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      if (profileName.trim()) {
        await api('PUT', 'api/users/profile', { full_name: profileName.trim() });
        // Update local storage
        const user = localStorage.getItem('user');
        if (user) {
          try {
            const parsed = JSON.parse(user);
            parsed.full_name = profileName.trim();
            localStorage.setItem('user', JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your TransitOps platform" />

      {/* Profile Settings */}
      <Card className="p-6">
        <h3 className="mb-5 text-base font-semibold text-zinc-100">Profile</h3>
        <div className="grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="mb-5 text-base font-semibold text-zinc-100">General Settings</h3>
        <div className="grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Depot Name"
              value={settings.depotName}
              onChange={(e) => setSettings({ ...settings, depotName: e.target.value })}
            />
          </div>
          <Select
            label="Currency"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            options={[
              { value: 'INR', label: 'INR (₹)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
            ]}
          />
          <Select
            label="Distance Unit"
            value={settings.distanceUnit}
            onChange={(e) => setSettings({ ...settings, distanceUnit: e.target.value })}
            options={[
              { value: 'km', label: 'Kilometers (km)' },
              { value: 'mi', label: 'Miles (mi)' },
            ]}
          />
        </div>
      </Card>

      {/* RBAC */}
      <Card className="p-6">
        <h3 className="mb-1 text-base font-semibold text-zinc-100">Role-Based Access Control</h3>
        <p className="mb-5 text-sm text-zinc-500">Permissions are enforced server-side. This table shows the current access matrix.</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Fleet</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Drivers</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Trips</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Maintenance</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Fuel</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Analytics</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {rbacRoles.map((role) => (
                <tr key={role.role} className="transition-colors hover:bg-zinc-800/30">
                  <td className="px-4 py-3.5 text-sm font-medium text-zinc-100">{role.role}</td>
                  <td className="px-4 py-3.5"><PermissionBadge permission={role.fleet} /></td>
                  <td className="px-4 py-3.5"><PermissionBadge permission={role.drivers} /></td>
                  <td className="px-4 py-3.5"><PermissionBadge permission={role.trips} /></td>
                  <td className="px-4 py-3.5"><PermissionBadge permission={role.maintenance} /></td>
                  <td className="px-4 py-3.5"><PermissionBadge permission={role.fuel} /></td>
                  <td className="px-4 py-3.5"><PermissionBadge permission={role.analytics} /></td>
                  <td className="px-4 py-3.5"><PermissionBadge permission={role.settings} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Settings
        </Button>
        {saved && (
          <span className="text-sm font-medium text-emerald-400 animate-pulse">
            ✓ Settings saved successfully
          </span>
        )}
        {saveError && (
          <span className="text-sm font-medium text-rose-400">
            ✗ {saveError}
          </span>
        )}
      </div>
    </div>
  );
}
