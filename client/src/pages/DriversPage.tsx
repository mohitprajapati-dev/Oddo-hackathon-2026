import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, Card, DataTable, SearchBar, Button, Modal, Input, Select, StatusBadge } from '../components/common';
import { drivers as initialDrivers } from '../data/drivers';
import { useSearch, useModal } from '../hooks';
import type { Driver, DriverStatus, LicenseCategory } from '../types';
import { generateId } from '../utils';

export function DriversPage() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const { isOpen, open, close } = useModal();
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(drivers, ['driverName', 'licenseNumber', 'contact']);

  const handleAddDriver = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newDriver: Driver = {
      id: generateId(),
      driverName: form.get('driverName') as string,
      licenseNumber: form.get('licenseNumber') as string,
      category: form.get('category') as LicenseCategory,
      licenseExpiry: form.get('licenseExpiry') as string,
      contact: form.get('contact') as string,
      tripCompletion: 0,
      safetyScore: Number(form.get('safetyScore')),
      status: 'Available' as DriverStatus,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    close();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Management"
        subtitle="Manage your driver registry"
        action={
          <Button onClick={open}>
            <Plus size={16} />
            Add Driver
          </Button>
        }
      />

      <Card className="p-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search drivers..."
          className="w-full sm:w-72"
        />
      </Card>

      <Card>
        <DataTable
          columns={[
            { key: 'driverName', label: 'Driver Name', render: (d) => (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-xs font-bold text-white">
                  {d.driverName.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-medium text-zinc-100">{d.driverName}</span>
              </div>
            )},
            { key: 'licenseNumber', label: 'License No.', render: (d) => <span className="font-mono text-xs">{d.licenseNumber}</span> },
            { key: 'category', label: 'Category' },
            { key: 'licenseExpiry', label: 'License Expiry' },
            { key: 'contact', label: 'Contact' },
            { key: 'tripCompletion', label: 'Trips', render: (d) => (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.tripCompletion}%` }} />
                </div>
                <span className="text-xs text-zinc-400">{d.tripCompletion}%</span>
              </div>
            )},
            { key: 'safetyScore', label: 'Safety', render: (d) => (
              <span className={`font-medium ${d.safetyScore >= 90 ? 'text-emerald-400' : d.safetyScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                {d.safetyScore}
              </span>
            )},
            { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
          ]}
          data={filteredItems}
          keyExtractor={(d) => d.id}
          emptyMessage="No drivers found"
        />
      </Card>

      {/* Add Driver Modal */}
      <Modal isOpen={isOpen} onClose={close} title="Add New Driver">
        <form onSubmit={handleAddDriver} className="space-y-4">
          <Input name="driverName" label="Driver Name" placeholder="Full name" required />
          <Input name="licenseNumber" label="License Number" placeholder="DL-XXXXXXXXX" required />
          <div className="grid grid-cols-2 gap-4">
            <Select
              name="category"
              label="License Category"
              options={[
                { value: 'A', label: 'Category A' },
                { value: 'B', label: 'Category B' },
                { value: 'C', label: 'Category C' },
                { value: 'D', label: 'Category D' },
                { value: 'E', label: 'Category E' },
              ]}
            />
            <Input name="licenseExpiry" label="License Expiry" type="date" required />
          </div>
          <Input name="contact" label="Phone Number" placeholder="+91 XXXXX XXXXX" required />
          <Input name="safetyScore" label="Safety Score" type="number" placeholder="0-100" min="0" max="100" required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={close}>Cancel</Button>
            <Button type="submit">Add Driver</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
