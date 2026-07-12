import { useState, useEffect, useCallback } from 'react';
import { Send, FileText, CheckCircle2, XCircle, ArrowRight, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { PageHeader, Card, DataTable, Button, Input, Select, StatusBadge } from '../components/common';
import api from '../services/api';
import { useData } from '../context/DataContext';

type TripStatus = 'Pending' | 'Dispatched' | 'Completed' | 'Cancelled';
type TabFilter = 'All' | TripStatus;

interface Trip {
  id: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight_kg: number;
  route_details: string | null;
  status: TripStatus;
  created_at: string;
  dispatched_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  vehicles?: { id: string; registration_number: string; vehicle_name: string };
  drivers?: { id: string; name: string; email: string };
}

interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_name: string;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  status: string | null;
}

const lifecycleSteps = [
  { status: 'Pending', icon: FileText, label: 'Pending' },
  { status: 'Dispatched', icon: Send, label: 'Dispatched' },
  { status: 'Completed', icon: CheckCircle2, label: 'Completed' },
  { status: 'Cancelled', icon: XCircle, label: 'Cancelled' },
];

const TABS: TabFilter[] = ['All', 'Pending', 'Dispatched', 'Completed', 'Cancelled'];

export function TripsPage() {
  const {
    trips: rawTrips, loadingTrips, errorTrips, fetchTrips,
    vehicles: rawVehicles, fetchVehicles,
    drivers: rawDrivers, fetchDrivers
  } = useData();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('All');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAll = useCallback(async (force = false) => {
    try {
      await Promise.all([
        fetchTrips(force),
        fetchVehicles(force),
        fetchDrivers(force),
      ]);
    } catch (err) {
      console.error('Error fetching trips page data:', err);
    }
  }, [fetchTrips, fetchVehicles, fetchDrivers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (rawTrips) setTrips(rawTrips);
  }, [rawTrips]);

  useEffect(() => {
    if (rawVehicles) {
      setVehicles(rawVehicles.map((v: any) => ({
        id: v.id,
        registration_number: v.registration_number,
        vehicle_name: v.vehicle_name,
        status: v.status,
      })));
    }
  }, [rawVehicles]);

  useEffect(() => {
    if (rawDrivers) {
      setDrivers(rawDrivers);
    }
  }, [rawDrivers]);

  const filteredTrips = activeTab === 'All' ? trips : trips.filter((t) => t.status === activeTab);

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'All' ? trips.length : trips.filter((t) => t.status === tab).length;
    return acc;
  }, {} as Record<TabFilter, number>);

  const handleCreateTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const payload = {
        vehicle_id: form.get('vehicle_id') as string,
        driver_id: form.get('driver_id') as string,
        cargo_weight_kg: Number(form.get('cargo_weight_kg')),
        route_details: form.get('route_details') as string || null,
      };
      if (!payload.vehicle_id || !payload.driver_id) {
        setFormError('Please select a vehicle and a driver.');
        return;
      }
      await api('POST', 'api/trips/create', payload);
      await fetchAll(true); // force refresh all caches
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (tripId: string, status: TripStatus) => {
    try {
      await api('POST', `api/trips/${tripId}/status`, { status });
      await fetchAll(true); // refresh all caches (vehicles/drivers/trips statuses)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update trip status');
    }
  };

  if (loadingTrips) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => !d.status || d.status === 'Available');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Dispatcher"
        subtitle="Create, dispatch, and track trips"
        action={
          <Button variant="secondary" onClick={() => fetchAll(true)}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        }
      />

      {errorTrips && (
        <Card className="flex items-center gap-3 border-rose-900 bg-rose-950/20 p-4 text-rose-300">
          <AlertTriangle size={18} />
          <p className="text-sm">{errorTrips}</p>
        </Card>
      )}

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
            <Select
              name="vehicle_id"
              label="Vehicle"
              options={[
                { value: '', label: availableVehicles.length ? 'Select vehicle...' : 'No available vehicles' },
                ...availableVehicles.map((v) => ({
                  value: v.id,
                  label: `${v.vehicle_name} (${v.registration_number})`,
                })),
              ]}
            />
            <Select
              name="driver_id"
              label="Driver"
              options={[
                { value: '', label: availableDrivers.length ? 'Select driver...' : 'No available drivers' },
                ...availableDrivers.map((d) => ({
                  value: d.id,
                  label: d.name || d.id,
                })),
              ]}
            />
            <Input
              name="cargo_weight_kg"
              label="Cargo Weight (kg)"
              type="number"
              placeholder="0"
              required
            />
            <Input
              name="route_details"
              label="Route Details (optional)"
              placeholder="e.g. Mumbai → Pune via NH-48"
            />

            {formError && (
              <p className="rounded-lg border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-sm text-rose-400">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Create Trip
            </Button>
          </form>
        </Card>

        {/* Live Trip Board */}
        <Card className="lg:col-span-2">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Live Trip Board</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {TABS.map((tab) => (
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
          <DataTable<Trip>
            columns={[
              {
                key: 'id', label: 'Trip ID',
                render: (t) => <span className="font-mono text-xs text-zinc-400">{t.id.slice(0, 8)}</span>
              },
              {
                key: 'vehicle_id', label: 'Vehicle',
                render: (t) => (
                  <div>
                    <p className="text-sm text-zinc-200">{t.vehicles?.vehicle_name || '—'}</p>
                    <p className="font-mono text-xs text-zinc-500">{t.vehicles?.registration_number || ''}</p>
                  </div>
                )
              },
              {
                key: 'driver_id', label: 'Driver',
                render: (t) => <span>{t.drivers?.name || '—'}</span>
              },
              {
                key: 'cargo_weight_kg', label: 'Cargo',
                render: (t) => <span className="text-zinc-400">{t.cargo_weight_kg} kg</span>
              },
              { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
              {
                key: 'actions', label: '',
                render: (t) => (
                  <div className="flex gap-2">
                    {t.status === 'Pending' && (
                      <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(t.id, 'Dispatched')}>
                        <Send size={12} />
                        Dispatch
                      </Button>
                    )}
                    {t.status === 'Dispatched' && (
                      <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(t.id, 'Completed')}>
                        <CheckCircle2 size={12} />
                        Complete
                      </Button>
                    )}
                    {(t.status === 'Pending' || t.status === 'Dispatched') && (
                      <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(t.id, 'Cancelled')}>
                        <XCircle size={12} />
                        Cancel
                      </Button>
                    )}
                  </div>
                )
              },
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
