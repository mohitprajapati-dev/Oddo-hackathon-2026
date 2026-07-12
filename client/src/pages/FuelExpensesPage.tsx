import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, Card, DataTable, Button, Modal, Input, Select } from '../components/common';
import { fuelLogs as initialFuelLogs } from '../data/fuelLogs';
import { expenses as initialExpenses } from '../data/expenses';
import { vehicles } from '../data/vehicles';
import type { FuelLog, Expense } from '../types';
import { formatCurrency, generateId } from '../utils';
import { useModal } from '../hooks';

export function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [expenseList, setExpenseList] = useState(initialExpenses);
  const fuelModal = useModal();
  const expenseModal = useModal();

  const handleAddFuel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vehicleId = form.get('vehicle') as string;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const newLog: FuelLog = {
      id: generateId(),
      vehicleId,
      vehicleName: vehicle?.vehicleName || '',
      date: form.get('date') as string,
      liters: Number(form.get('liters')),
      cost: Number(form.get('cost')),
    };
    setFuelLogs((prev) => [newLog, ...prev]);
    fuelModal.close();
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vehicleId = form.get('vehicle') as string;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const toll = Number(form.get('toll'));
    const other = Number(form.get('other'));
    const maintenance = Number(form.get('maintenance'));
    const newExpense: Expense = {
      id: generateId(),
      tripId: form.get('tripId') as string,
      vehicleId,
      vehicleName: vehicle?.vehicleName || '',
      toll,
      other,
      maintenance,
      total: toll + other + maintenance,
    };
    setExpenseList((prev) => [newExpense, ...prev]);
    expenseModal.close();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Fuel & Expenses" subtitle="Track fuel consumption and operational expenses" />

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
            options={[
              { value: '', label: 'Select vehicle...' },
              ...vehicles.map((v) => ({ value: v.id, label: v.vehicleName })),
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
            options={[
              { value: '', label: 'Select vehicle...' },
              ...vehicles.map((v) => ({ value: v.id, label: v.vehicleName })),
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
