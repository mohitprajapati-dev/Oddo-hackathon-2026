import { useState } from 'react';
import { Send, FileText, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { PageHeader, Card, DataTable, Button, Input, Select, StatusBadge } from '../components/common';
import { trips as initialTrips } from '../data/trips';
import { vehicles } from '../data/vehicles';
import { drivers } from '../data/drivers';
import type { Trip, TripStatus } from '../types';
import { generateId } from '../utils';

const lifecycleSteps: { status: TripStatus; icon: React.ElementType; label: string }[] = [
  { status: 'Draft', icon: FileText, label: 'Draft' },
  { status: 'Dispatched', icon: Send, label: 'Dispatched' },
  { status: 'Completed', icon: CheckCircle2, label: 'Completed' },
  { status: 'Cancelled', icon: XCircle, label: 'Cancelled' },
];

export function TripsPage() {
  const [allTrips, setAllTrips] = useState(initialTrips);
  const [activeTab, setActiveTab] = useState<TripStatus | 'All'>('All');

  const filteredTrips = activeTab === 'All' ? allTrips : allTrips.filter((t) => t.status === activeTab);

  const handleCreateTrip = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vehicleId = form.get('vehicle') as string;
    const driverId = form.get('driver') as string;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const driver = drivers.find((d) => d.id === driverId);

    const newTrip: Trip = {
      id: generateId(),
      tripId: `TRP-2024-${String(allTrips.length + 1).padStart(3, '0')}`,
      source: form.get('source') as string,
      destination: form.get('destination') as string,
      vehicleId,
      vehicleName: vehicle?.vehicleName || '',
      driverId,
      driverName: driver?.driverName || '',
      cargoWeight: Number(form.get('cargoWeight')),
      distance: Number(form.get('distance')),
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAllTrips((prev) => [newTrip, ...prev]);
    (e.target as HTMLFormElement).reset();
  };

  const handleDispatch = (tripId: string) => {
    setAllTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, status: 'Dispatched' as TripStatus, eta: '—' } : t
      )
    );
  };

  const tabCounts = {
    All: allTrips.length,
    Draft: allTrips.filter((t) => t.status === 'Draft').length,
    Dispatched: allTrips.filter((t) => t.status === 'Dispatched').length,
    Completed: allTrips.filter((t) => t.status === 'Completed').length,
    Cancelled: allTrips.filter((t) => t.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Trip Dispatcher" subtitle="Create, dispatch, and track trips" />

      {/* Lifecycle */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-100">Trip Lifecycle</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {lifecycleSteps.map((step, i) => (
            <div key={step.status} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-4 py-2.5">
                <step.icon size={16} className="text-zinc-400" />
                <span className="whitespace-nowrap text-sm text-zinc-300">{step.label}</span>
              </div>
              {i < lifecycleSteps.length - 1 && (
                <ArrowRight size={14} className="shrink-0 text-zinc-600" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create Trip Form */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Create Trip</h3>
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <Input name="source" label="Source" placeholder="Origin depot" required />
            <Input name="destination" label="Destination" placeholder="Destination hub" required />
            <Select
              name="vehicle"
              label="Vehicle"
              options={[
                { value: '', label: 'Select vehicle...' },
                ...vehicles
                  .filter((v) => v.status === 'Available')
                  .map((v) => ({ value: v.id, label: `${v.vehicleName} (${v.registrationNumber})` })),
              ]}
            />
            <Select
              name="driver"
              label="Driver"
              options={[
                { value: '', label: 'Select driver...' },
                ...drivers
                  .filter((d) => d.status === 'Available')
                  .map((d) => ({ value: d.id, label: d.driverName })),
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input name="cargoWeight" label="Cargo (kg)" type="number" placeholder="0" required />
              <Input name="distance" label="Distance (km)" type="number" placeholder="0" required />
            </div>
            <Button type="submit" className="w-full">
              <Send size={14} />
              Create Draft Trip
            </Button>
          </form>
        </Card>

        {/* Live Trip Board */}
        <Card className="lg:col-span-2">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Live Trip Board</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                  <span className="ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px]">
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <DataTable
            columns={[
              { key: 'tripId', label: 'Trip ID', render: (t) => <span className="font-mono text-xs text-zinc-400">{t.tripId}</span> },
              { key: 'vehicleName', label: 'Vehicle' },
              { key: 'driverName', label: 'Driver' },
              { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
              { key: 'actions', label: '', render: (t) => (
                t.status === 'Draft' ? (
                  <Button size="sm" variant="secondary" onClick={() => handleDispatch(t.id)}>
                    <Send size={12} />
                    Dispatch
                  </Button>
                ) : null
              )},
            ]}
            data={filteredTrips}
            keyExtractor={(t) => t.id}
            emptyMessage="No trips found"
          />
        </Card>
      </div>
    </div>
  );
}
