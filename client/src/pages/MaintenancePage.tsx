import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { PageHeader, Card, DataTable, Button, Modal, Input, Select, StatusBadge } from '../components/common';
import type { MaintenanceLog, Vehicle } from '../types';
import { formatCurrency } from '../utils';
import { useModal } from '../hooks';
import api from '../services/api';
import { useData } from '../context/DataContext';

export function MaintenancePage() {
  const {
    vehicles: rawVehicles, fetchVehicles,
    maintenance: rawMaintenance, loadingMaintenance, errorMaintenance, fetchMaintenance
  } = useData();

  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const { isOpen, open, close } = useModal();

  const loadData = useCallback(async (force = false) => {
    try {
      await Promise.all([
        fetchVehicles(force),
        fetchMaintenance(force)
      ]);
    } catch (err) {
      console.error('Error fetching maintenance page data:', err);
    }
  }, [fetchVehicles, fetchMaintenance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (rawVehicles) {
      setVehicleList(rawVehicles.map((v: any) => ({
        id: v.id,
        registrationNumber: v.registration_number,
        vehicleName: v.vehicle_name,
        vehicleType: v.vehicle_type,
        capacity: Number(v.max_load_capacity),
        odometer: Number(v.odometer),
        acquisitionCost: Number(v.acquisition_cost),
        status: v.status,
      })));
    }
  }, [rawVehicles]);

  useEffect(() => {
    if (rawMaintenance) {
      const mapped = rawMaintenance.map((m: any) => ({
        id: m.id,
        vehicleId: m.vehicle_id,
        vehicleName: m.vehicles?.vehicle_name || 'Unknown Vehicle',
        service: m.description,
        cost: Number(m.cost),
        date: m.start_date ? new Date(m.start_date).toLocaleDateString() : '',
        status: m.status,
      }));
      setLogs(mapped);
    }
  }, [rawMaintenance]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vehicleId = form.get('vehicle') as string;
    try {
      const maintData = {
        vehicle_id: vehicleId,
        description: form.get('service') as string,
        cost: Number(form.get('cost')),
        start_date: form.get('date') as string,
      };

      await api('POST', 'api/maintenance', maintData);
      // Refresh cache
      await Promise.all([
        fetchMaintenance(true),
        fetchVehicles(true)
      ]);
      close();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed to add maintenance log');
    }
  };


  const handleCompleteClick = async (m: MaintenanceLog) => {
    const finalCostInput = prompt(`Mark maintenance for "${m.vehicleName}" as Completed.\nEnter the final cost (in ₹):`, m.cost.toString());
    if (finalCostInput === null) return;

    const finalCost = Number(finalCostInput);
    if (isNaN(finalCost) || finalCost < 0) {
      alert("Please enter a valid positive number for the cost.");
      return;
    }

    try {
      await api('PUT', `api/maintenance/${m.id}/complete`, {
        cost: finalCost,
        end_date: new Date().toISOString()
      });
      await loadData(true);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed to complete maintenance log');
    }
  };

  if (loadingMaintenance) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Logs"
        subtitle="Track vehicle maintenance and service history"
        action={
          <Button onClick={open}>
            <Plus size={16} />
            Add Maintenance
          </Button>
        }
      />

      {errorMaintenance && (
        <Card className="flex items-center gap-3 border-rose-900 bg-rose-950/20 p-4 text-rose-300">
          <AlertTriangle size={18} />
          <p className="text-sm">{errorMaintenance}</p>
        </Card>
      )}

      <Card>
        <DataTable
          columns={[
            { key: 'vehicleName', label: 'Vehicle', render: (m) => <span className="font-medium text-zinc-100">{m.vehicleName}</span> },
            { key: 'service', label: 'Service' },
            { key: 'cost', label: 'Cost', render: (m) => formatCurrency(m.cost) },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} /> },
            {
              key: 'actions',
              label: 'Actions',
              render: (m) => (
                String(m.status) === 'Active' ? (
                  <Button size="sm" variant="secondary" onClick={() => handleCompleteClick(m)}>
                    Complete
                  </Button>
                ) : <span className="text-xs text-zinc-500">—</span>
              )
            }
          ]}
          data={logs}
          keyExtractor={(m) => m.id}
          emptyMessage="No maintenance records"
        />
      </Card>

      <Modal isOpen={isOpen} onClose={close} title="Add Maintenance Record">
        <form onSubmit={handleAdd} className="space-y-4">
          <Select
            name="vehicle"
            label="Vehicle"
            required
            options={[
              { value: '', label: 'Select vehicle...' },
              ...vehicleList.map((v) => ({ value: v.id, label: `${v.vehicleName} (${v.registrationNumber})` })),
            ]}
          />
          <Input name="service" label="Service Type" placeholder="e.g., Oil Change" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="cost" label="Cost (₹)" type="number" placeholder="0" required />
            <Input name="date" label="Date" type="date" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={close}>Cancel</Button>
            <Button type="submit">Add Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
