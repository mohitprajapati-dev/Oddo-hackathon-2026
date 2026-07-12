import { useDashboard } from '../hooks/useDashboard';
import {
  Truck, CheckCircle, Wrench, Route, Clock, Users, Activity,
  Fuel, DollarSign, ShieldCheck, AlertTriangle, Loader2,
} from 'lucide-react';
import { KPICard, Card, DataTable, ProgressBar, PageHeader } from '../components/common';
import { StatusBadge } from '../components/common';

// ─── Shared helper ────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Fleet Manager Dashboard ──────────────────────────────────────────────────
function FleetManagerDashboard({ data }: { data: any }) {
  const { kpis, recentTrips, vehicles } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Vehicles" value={kpis.totalVehicles} icon={<Truck size={20} />} />
        <KPICard title="Available" value={kpis.availableVehicles} icon={<CheckCircle size={20} />} />
        <KPICard title="In Maintenance" value={kpis.inShopVehicles} icon={<Wrench size={20} />} />
        <KPICard title="Active Trips" value={kpis.activeTrips} icon={<Route size={20} />} />
        <KPICard title="Pending Trips" value={kpis.pendingTrips} icon={<Clock size={20} />} />
        <KPICard title="Drivers On Duty" value={kpis.driversOnDuty} icon={<Users size={20} />} />
        <KPICard title="Fleet Utilization" value={`${kpis.fleetUtilization}%`} icon={<Activity size={20} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Trips</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Latest dispatched and completed trips</p>
          </div>
          {recentTrips?.length > 0 ? (
            <DataTable
              columns={[
                { key: 'id', label: 'Trip ID', render: (t: any) => <span className="font-mono text-xs text-zinc-400">{t.id?.slice(0, 8)}</span> },
                { key: 'vehicle', label: 'Vehicle', render: (t: any) => <span>{t.vehicles?.registration_number || '—'}</span> },
                { key: 'driver', label: 'Driver', render: (t: any) => <span>{t.drivers?.name || '—'}</span> },
                { key: 'status', label: 'Status', render: (t: any) => <StatusBadge status={t.status} /> },
                { key: 'destination', label: 'Destination', render: (t: any) => <span className="text-zinc-400">{t.destination || '—'}</span> },
              ]}
              data={recentTrips}
              keyExtractor={(t: any) => t.id}
            />
          ) : (
            <EmptyState message="No trips found for your fleet." />
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-100">Vehicle Status</h3>
          <p className="mb-5 mt-0.5 text-xs text-zinc-500">{kpis.totalVehicles} total vehicles</p>
          <div className="space-y-4">
            <ProgressBar label="Available" value={kpis.availableVehicles} total={kpis.totalVehicles} color="bg-emerald-500" />
            <ProgressBar label="On Trip" value={kpis.onTripVehicles} total={kpis.totalVehicles} color="bg-blue-500" />
            <ProgressBar label="In Shop" value={kpis.inShopVehicles} total={kpis.totalVehicles} color="bg-amber-500" />
            <ProgressBar label="Retired" value={kpis.retiredVehicles} total={kpis.totalVehicles} color="bg-red-500" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Driver Dashboard ─────────────────────────────────────────────────────────
function DriverDashboard({ data }: { data: any }) {
  const { profile, kpis, trips } = data;
  return (
    <div className="space-y-6">
      {profile && (
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-zinc-100">
              {profile.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-semibold text-zinc-100">{profile.name}</p>
              <p className="text-sm text-zinc-500">{profile.email}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={profile.status || 'Active'} />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Trips" value={kpis.totalTrips} icon={<Route size={20} />} />
        <KPICard title="Completed" value={kpis.completedTrips} icon={<CheckCircle size={20} />} />
        <KPICard title="In Progress" value={kpis.activeTrips} icon={<Activity size={20} />} />
        <KPICard title="Scheduled" value={kpis.scheduledTrips} icon={<Clock size={20} />} />
      </div>

      <Card>
        <div className="border-b border-zinc-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-100">My Trips</h3>
          <p className="mt-0.5 text-xs text-zinc-500">All your assigned trips</p>
        </div>
        {trips?.length > 0 ? (
          <DataTable
            columns={[
              { key: 'id', label: 'Trip ID', render: (t: any) => <span className="font-mono text-xs text-zinc-400">{t.id?.slice(0, 8)}</span> },
              { key: 'vehicle', label: 'Vehicle', render: (t: any) => <span>{t.vehicles?.registration_number || '—'}</span> },
              { key: 'origin', label: 'Origin', render: (t: any) => <span className="text-zinc-400">{t.origin || '—'}</span> },
              { key: 'destination', label: 'Destination', render: (t: any) => <span className="text-zinc-400">{t.destination || '—'}</span> },
              { key: 'status', label: 'Status', render: (t: any) => <StatusBadge status={t.status} /> },
            ]}
            data={trips}
            keyExtractor={(t: any) => t.id}
          />
        ) : (
          <EmptyState message="No trips assigned to you yet." />
        )}
      </Card>
    </div>
  );
}

// ─── Safety Officer Dashboard ──────────────────────────────────────────────────
function SafetyOfficerDashboard({ data }: { data: any }) {
  const { kpis, drivers } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Total Drivers" value={kpis.totalDrivers} icon={<Users size={20} />} />
        <KPICard title="Active Drivers" value={kpis.activeDrivers} icon={<ShieldCheck size={20} />} />
        <KPICard title="License Expiring Soon" value={kpis.licenseExpiringSoon} icon={<AlertTriangle size={20} />} trend={kpis.licenseExpiringSoon > 0 ? { value: kpis.licenseExpiringSoon, positive: false } : undefined} />
      </div>

      <Card>
        <div className="border-b border-zinc-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-100">Driver Compliance</h3>
          <p className="mt-0.5 text-xs text-zinc-500">All registered drivers and their status</p>
        </div>
        {drivers?.length > 0 ? (
          <DataTable
            columns={[
              { key: 'name', label: 'Driver' },
              { key: 'email', label: 'Email', render: (d: any) => <span className="text-zinc-400">{d.email || '—'}</span> },
              { key: 'license', label: 'License No.', render: (d: any) => <span className="font-mono text-xs text-zinc-400">{d.license_number || '—'}</span> },
              { key: 'expiry', label: 'License Expiry', render: (d: any) => {
                if (!d.license_expiry) return <span className="text-zinc-500">—</span>;
                const expiry = new Date(d.license_expiry);
                const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const color = daysLeft <= 30 ? 'text-rose-400' : daysLeft <= 90 ? 'text-amber-400' : 'text-zinc-400';
                return <span className={color}>{expiry.toLocaleDateString()} ({daysLeft}d)</span>;
              }},
              { key: 'status', label: 'Status', render: (d: any) => <StatusBadge status={d.status || 'Active'} /> },
            ]}
            data={drivers}
            keyExtractor={(d: any) => d.id}
          />
        ) : (
          <EmptyState message="No drivers registered yet." />
        )}
      </Card>
    </div>
  );
}

// ─── Financial Analyst Dashboard ──────────────────────────────────────────────
function FinancialAnalystDashboard({ data }: { data: any }) {
  const { kpis, fuelLogs, expenses, expenseByCategory } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Total Expenses" value={`₹${kpis.totalExpenses?.toLocaleString('en-IN') || 0}`} icon={<DollarSign size={20} />} />
        <KPICard title="Fuel Cost" value={`₹${kpis.totalFuelCost?.toLocaleString('en-IN') || 0}`} icon={<Fuel size={20} />} />
        <KPICard title="Fuel Consumed" value={`${kpis.totalFuelLiters?.toFixed(1) || 0} L`} icon={<Activity size={20} />} />
      </div>

      {expenseByCategory && Object.keys(expenseByCategory).length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Expenses by Category</h3>
          <div className="space-y-3">
            {Object.entries(expenseByCategory).map(([category, amount]: [string, any]) => (
              <ProgressBar
                key={category}
                label={category}
                value={amount}
                total={kpis.totalExpenses || 1}
                color="bg-blue-500"
              />
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Fuel Logs</h3>
          </div>
          {fuelLogs?.length > 0 ? (
            <DataTable
              columns={[
                { key: 'vehicle', label: 'Vehicle', render: (f: any) => <span>{f.vehicles?.registration_number || '—'}</span> },
                { key: 'amount_liters', label: 'Liters', render: (f: any) => <span>{f.amount_liters} L</span> },
                { key: 'cost', label: 'Cost', render: (f: any) => <span>₹{f.cost?.toLocaleString('en-IN')}</span> },
                { key: 'logged_at', label: 'Date', render: (f: any) => <span className="text-zinc-400">{new Date(f.logged_at).toLocaleDateString()}</span> },
              ]}
              data={fuelLogs}
              keyExtractor={(f: any) => f.id}
            />
          ) : (
            <EmptyState message="No fuel logs recorded yet." />
          )}
        </Card>

        <Card>
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Expenses</h3>
          </div>
          {expenses?.length > 0 ? (
            <DataTable
              columns={[
                { key: 'category', label: 'Category', render: (e: any) => <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">{e.category}</span> },
                { key: 'amount', label: 'Amount', render: (e: any) => <span>₹{e.amount?.toLocaleString('en-IN')}</span> },
                { key: 'logged_at', label: 'Date', render: (e: any) => <span className="text-zinc-400">{new Date(e.logged_at).toLocaleDateString()}</span> },
              ]}
              data={expenses}
              keyExtractor={(e: any) => e.id}
            />
          ) : (
            <EmptyState message="No expenses recorded yet." />
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { loading, error, role, data, filters, updateFilters, clearFilters } = useDashboard();

  const subtitles: Record<string, string> = {
    'Fleet Manager': 'Your complete fleet overview.',
    'Driver': 'Your trips and driving activity.',
    'Safety Officer': 'Driver compliance and safety status.',
    'Financial Analyst': 'Fuel consumption and expenses overview.',
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-zinc-400">
        <AlertTriangle className="h-8 w-8 text-rose-400" />
        <p className="text-sm text-rose-300">{error}</p>
      </div>
    );
  }

  const hasActiveFilters = filters.vehicle_type || filters.vehicle_status || filters.region;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={role ? subtitles[role] : 'Welcome back.'}
      />

      {/* Filters — Fleet Manager only */}
      {role === 'Fleet Manager' && (
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Vehicle Type</label>
              <select
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500"
                value={filters.vehicle_type || ''}
                onChange={(e) => updateFilters({ ...filters, vehicle_type: e.target.value || undefined })}
              >
                <option value="">All Types</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Bus">Bus</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Vehicle Status</label>
              <select
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500"
                value={filters.vehicle_status || ''}
                onChange={(e) => updateFilters({ ...filters, vehicle_status: e.target.value || undefined })}
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Region</label>
              <input
                type="text"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500"
                placeholder="e.g. North"
                value={filters.region || ''}
                onChange={(e) => updateFilters({ ...filters, region: e.target.value || undefined })}
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        </Card>
      )}

      {role === 'Fleet Manager' && <FleetManagerDashboard data={data} />}
      {role === 'Driver' && <DriverDashboard data={data} />}
      {role === 'Safety Officer' && <SafetyOfficerDashboard data={data} />}
      {role === 'Financial Analyst' && <FinancialAnalystDashboard data={data} />}
    </div>
  );
}

