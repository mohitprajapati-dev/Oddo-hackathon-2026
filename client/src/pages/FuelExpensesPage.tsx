import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { PageHeader, Card, DataTable, Button, Modal, Input, Select } from '../components/common';
import type { FuelLog, Expense, Vehicle } from '../types';
import { formatCurrency } from '../utils';
import { useModal } from '../hooks';
import api from '../services/api';
import { useData } from '../context/DataContext';

export function FuelExpensesPage() {
  const {
    vehicles: rawVehicles, fetchVehicles,
    fuel: rawFuel, fetchFuel, loadingFuel, errorFuel,
    expenses: rawExpenses, fetchExpenses, loadingExpenses, errorExpenses
  } = useData();

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);

  const fuelModal = useModal();
  const expenseModal = useModal();

  const fetchData = useCallback(async (force = false) => {
    try {
      await Promise.all([
        fetchVehicles(force),
        fetchFuel(force),
        fetchExpenses(force),
      ]);
    } catch (err) {
      console.error('Error fetching fuel/expenses data:', err);
    }
  }, [fetchVehicles, fetchFuel, fetchExpenses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (rawFuel) {
      setFuelLogs(rawFuel.map((f: any) => ({
        id: f.id,
        vehicleId: f.vehicle_id,
        vehicleName: f.vehicles?.vehicle_name || 'Unknown Vehicle',
        date: f.logged_at ? new Date(f.logged_at).toLocaleDateString() : '',
        liters: Number(f.amount_liters),
        cost: Number(f.cost),
      })));
    }
  }, [rawFuel]);

  useEffect(() => {
    if (rawExpenses) {
      const mappedExpenses = rawExpenses.map((e: any) => {
        const isToll = e.category === 'Toll';
        const isMaint = e.category === 'Maintenance' || e.category === 'Repair';
        
        let tripLabel = e.trip_id || 'N/A';
        if (!e.trip_id && e.description && e.description.includes('Trip: ')) {
          const match = e.description.match(/Trip:\s*([^\s-]+)/);
          if (match) tripLabel = match[1];
        }

        return {
          id: e.id,
          tripId: tripLabel,
          vehicleId: e.vehicle_id || '',
          vehicleName: e.vehicles?.vehicle_name || 'General Expense',
          toll: isToll ? Number(e.amount) : 0,
          maintenance: isMaint ? Number(e.amount) : 0,
          other: (!isToll && !isMaint) ? Number(e.amount) : 0,
          total: Number(e.amount),
        };
      });
      setExpenseList(mappedExpenses);
    }
  }, [rawExpenses]);

  const handleAddFuel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vehicleId = form.get('vehicle') as string;
    try {
      const fuelData = {
        vehicle_id: vehicleId,
        amount_liters: Number(form.get('liters')),
        cost: Number(form.get('cost')),
        logged_at: form.get('date') as string,
        notes: "Fuel Refill",
      };

      await api('POST', 'api/fuel', fuelData);
      await fetchData(true);
      fuelModal.close();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed to add fuel log');
    }
  };

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vehicleId = form.get('vehicle') as string;
    const tripId = form.get('tripId') as string;
    const toll = Number(form.get('toll'));
    const other = Number(form.get('other'));
    const maintenance = Number(form.get('maintenance'));

    // Check if tripId is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tripId);
    const formattedTripId = isUuid ? tripId : null;

    try {
      setError(null);

      // Create a separate call for each active category amount
      if (toll > 0) {
        await api('POST', 'api/expenses', {
          vehicle_id: vehicleId || null,
          trip_id: formattedTripId,
          category: 'Toll',
          amount: toll,
          description: `Toll fee. Trip: ${tripId}`,
        });
      }
      if (maintenance > 0) {
        await api('POST', 'api/expenses', {
          vehicle_id: vehicleId || null,
          trip_id: formattedTripId,
          category: 'Maintenance',
          amount: maintenance,
          description: `Maintenance fee. Trip: ${tripId}`,
        });
      }
      if (other > 0) {
        await api('POST', 'api/expenses', {
          vehicle_id: vehicleId || null,
          trip_id: formattedTripId,
          category: 'Other',
          amount: other,
          description: `Other fee. Trip: ${tripId}`,
        });
      }

      await fetchData(true);
      expenseModal.close();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed to add expense record');
    }
  };

  if (loadingFuel || loadingExpenses) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const combinedError = errorFuel || errorExpenses;

  return (
    <div className="space-y-6">
      <PageHeader title="Fuel & Expenses" subtitle="Track fuel consumption and operational expenses" />

      {combinedError && (
        <Card className="flex items-center gap-3 border-rose-900 bg-rose-950/20 p-4 text-rose-300">
          <AlertTriangle size={18} />
          <p className="text-sm">{combinedError}</p>
        </Card>
      )}

      {/* Fuel Logs */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Fuel Logs</h2>
          <Button onClick={fuelModal.open} size="sm">
            <Plus size={14} />
            Log Fuel
          </Button>
        </div>
        <Card>
          <DataTable
            columns={[
              { key: 'vehicleName', label: 'Vehicle', render: (f) => <span className="font-medium text-zinc-100">{f.vehicleName}</span> },
              { key: 'date', label: 'Date' },
              { key: 'liters', label: 'Liters', render: (f) => `${f.liters} L` },
              { key: 'cost', label: 'Cost', render: (f) => formatCurrency(f.cost) },
            ]}
            data={fuelLogs}
            keyExtractor={(f) => f.id}
            emptyMessage="No fuel logs"
          />
        </Card>
      </div>

      {/* Expenses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Expenses</h2>
          <Button onClick={expenseModal.open} size="sm">
            <Plus size={14} />
            Add Expense
          </Button>
        </div>
        <Card>
          <DataTable
            columns={[
              { key: 'tripId', label: 'Trip', render: (e) => <span className="font-mono text-xs text-zinc-400">{e.tripId}</span> },
              { key: 'vehicleName', label: 'Vehicle' },
              { key: 'toll', label: 'Toll', render: (e) => formatCurrency(e.toll) },
              { key: 'other', label: 'Other', render: (e) => formatCurrency(e.other) },
              { key: 'maintenance', label: 'Maintenance', render: (e) => formatCurrency(e.maintenance) },
              { key: 'total', label: 'Total', render: (e) => <span className="font-medium text-zinc-100">{formatCurrency(e.total)}</span> },
            ]}
            data={expenseList}
            keyExtractor={(e) => e.id}
            emptyMessage="No expenses recorded"
          />
        </Card>
      </div>

      {/* Fuel Modal */}
      <Modal isOpen={fuelModal.isOpen} onClose={fuelModal.close} title="Log Fuel Entry">
        <form onSubmit={handleAddFuel} className="space-y-4">
          <Select
            name="vehicle"
            label="Vehicle"
            required
            options={[
              { value: '', label: 'Select vehicle...' },
              ...vehicleList.map((v) => ({ value: v.id, label: v.vehicleName })),
            ]}
          />
          <Input name="date" label="Date" type="date" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="liters" label="Liters" type="number" placeholder="0" required />
            <Input name="cost" label="Cost (₹)" type="number" placeholder="0" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={fuelModal.close}>Cancel</Button>
            <Button type="submit">Log Fuel</Button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={expenseModal.isOpen} onClose={expenseModal.close} title="Add Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input name="tripId" label="Trip ID" placeholder="TRP-2024-XXX" required />
          <Select
            name="vehicle"
            label="Vehicle"
            required
            options={[
              { value: '', label: 'Select vehicle...' },
              ...vehicleList.map((v) => ({ value: v.id, label: v.vehicleName })),
            ]}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input name="toll" label="Toll (₹)" type="number" placeholder="0" required />
            <Input name="other" label="Other (₹)" type="number" placeholder="0" required />
            <Input name="maintenance" label="Maintenance (₹)" type="number" placeholder="0" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={expenseModal.close}>Cancel</Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
