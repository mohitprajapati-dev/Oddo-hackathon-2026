import { useState } from 'react';
import {
  Truck,
  CheckCircle,
  Wrench,
  Route,
  Clock,
  Users,
  Activity,
} from 'lucide-react';
import { KPICard, Card, DataTable, ProgressBar, PageHeader } from '../components/common';
import { Select } from '../components/common';
import { StatusBadge } from '../components/common';
import { kpiData, vehicleStatusBreakdown } from '../data/dashboard';
import { trips } from '../data/trips';

export function DashboardPage() {
  const [vehicleType, setVehicleType] = useState('all');
  const [status, setStatus] = useState('all');
  const [region, setRegion] = useState('all');

  const recentTrips = trips.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome back, Arjun. Here's your fleet overview." />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            options={[
              { value: 'all', label: 'All Vehicle Types' },
              { value: 'Truck', label: 'Truck' },
              { value: 'Van', label: 'Van' },
              { value: 'Bus', label: 'Bus' },
              { value: 'SUV', label: 'SUV' },
              { value: 'Sedan', label: 'Sedan' },
            ]}
            className="w-44"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'In Shop', label: 'In Shop' },
              { value: 'Retired', label: 'Retired' },
            ]}
            className="w-40"
          />
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={[
              { value: 'all', label: 'All Regions' },
              { value: 'south', label: 'South' },
              { value: 'north', label: 'North' },
              { value: 'west', label: 'West' },
              { value: 'east', label: 'East' },
            ]}
            className="w-40"
          />
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active Vehicles"
          value={kpiData.activeVehicles}
          icon={<Truck size={20} />}
          trend={{ value: 5.2, positive: true }}
        />
        <KPICard
          title="Available Vehicles"
          value={kpiData.availableVehicles}
          icon={<CheckCircle size={20} />}
        />
        <KPICard
          title="In Maintenance"
          value={kpiData.vehiclesInMaintenance}
          icon={<Wrench size={20} />}
        />
        <KPICard
          title="Active Trips"
          value={kpiData.activeTrips}
          icon={<Route size={20} />}
          trend={{ value: 12, positive: true }}
        />
        <KPICard
          title="Pending Trips"
          value={kpiData.pendingTrips}
          icon={<Clock size={20} />}
        />
        <KPICard
          title="Drivers On Duty"
          value={kpiData.driversOnDuty}
          icon={<Users size={20} />}
        />
        <KPICard
          title="Fleet Utilization"
          value={`${kpiData.fleetUtilization}%`}
          icon={<Activity size={20} />}
          trend={{ value: 3.1, positive: true }}
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Trips */}
        <Card className="lg:col-span-2">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Trips</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Latest dispatched and completed trips</p>
          </div>
          <DataTable
            columns={[
              { key: 'tripId', label: 'Trip ID', render: (t) => <span className="font-mono text-xs text-zinc-400">{t.tripId}</span> },
              { key: 'vehicleName', label: 'Vehicle' },
              { key: 'driverName', label: 'Driver' },
              { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
              { key: 'eta', label: 'ETA', render: (t) => <span className="text-zinc-400">{t.eta || '—'}</span> },
            ]}
            data={recentTrips}
            keyExtractor={(t) => t.id}
          />
        </Card>

        {/* Vehicle Status */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-100">Vehicle Status</h3>
          <p className="mb-5 mt-0.5 text-xs text-zinc-500">
            {vehicleStatusBreakdown.total} total vehicles
          </p>
          <div className="space-y-4">
            <ProgressBar
              label="Available"
              value={vehicleStatusBreakdown.available}
              total={vehicleStatusBreakdown.total}
              color="bg-emerald-500"
            />
            <ProgressBar
              label="On Trip"
              value={vehicleStatusBreakdown.onTrip}
              total={vehicleStatusBreakdown.total}
              color="bg-blue-500"
            />
            <ProgressBar
              label="In Shop"
              value={vehicleStatusBreakdown.inShop}
              total={vehicleStatusBreakdown.total}
              color="bg-amber-500"
            />
            <ProgressBar
              label="Retired"
              value={vehicleStatusBreakdown.retired}
              total={vehicleStatusBreakdown.total}
              color="bg-red-500"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
