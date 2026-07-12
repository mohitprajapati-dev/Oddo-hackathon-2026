import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, Card, DataTable, Button, Modal, Input, Select, StatusBadge } from '../components/common';
import { maintenanceLogs as initialLogs } from '../data/maintenance';
import { vehicles } from '../data/vehicles';
import type { MaintenanceLog, MaintenanceStatus } from '../types';
import { formatCurrency, generateId } from '../utils';
import { useModal } from '../hooks';

export function MaintenancePage() {
  const [logs, setLogs] = useState(initialLogs);
  const { isOpen, open, close } = useModal();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vehicleId = form.get('vehicle') as string;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const newLog: MaintenanceLog = {
      id: generateId(),
      vehicleId,
      vehicleName: vehicle?.vehicleName || '',
      service: form.get('service') as string,
      cost: Number(form.get('cost')),
      date: form.get('date') as string,
      status: form.get('status') as MaintenanceStatus,
    };
    setLogs((prev) => [newLog, ...prev]);
    close();
  };

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

      <Card>
        <DataTable
          columns={[
            { key: 'vehicleName', label: 'Vehicle', render: (m) => <span className="font-medium text-zinc-100">{m.vehicleName}</span> },
            { key: 'service', label: 'Service' },
            { key: 'cost', label: 'Cost', render: (m) => formatCurrency(m.cost) },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} /> },
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
            options={[
              { value: '', label: 'Select vehicle...' },
              ...vehicles.map((v) => ({ value: v.id, label: `${v.vehicleName} (${v.registrationNumber})` })),
            ]}
          />
          <Input name="service" label="Service Type" placeholder="e.g., Oil Change" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="cost" label="Cost (₹)" type="number" placeholder="0" required />
            <Input name="date" label="Date" type="date" required />
          </div>
          <Select
            name="status"
            label="Status"
            options={[
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Overdue', label: 'Overdue' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={close}>Cancel</Button>
            <Button type="submit">Add Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
