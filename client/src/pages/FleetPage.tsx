import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, Card, DataTable, SearchBar, Button, Modal, Input, Select, StatusBadge } from '../components/common';
import { vehicles as initialVehicles } from '../data/vehicles';
import { useSearch, useModal } from '../hooks';
import type { Vehicle, VehicleType, VehicleStatus } from '../types';
import { formatCurrency, formatNumber, generateId } from '../utils';

export function FleetPage() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { isOpen, open, close } = useModal();
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(vehicles, ['registrationNumber', 'vehicleName', 'vehicleType']);

  const displayVehicles = filteredItems.filter((v) => {
    if (filterType !== 'all' && v.vehicleType !== filterType) return false;
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    return true;
  });

  const handleAddVehicle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newVehicle: Vehicle = {
      id: generateId(),
      registrationNumber: form.get('registrationNumber') as string,
      vehicleName: form.get('vehicleName') as string,
      vehicleType: form.get('vehicleType') as VehicleType,
      capacity: Number(form.get('capacity')),
      odometer: Number(form.get('odometer')),
      acquisitionCost: Number(form.get('acquisitionCost')),
      status: form.get('status') as VehicleStatus,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    close();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Management"
        subtitle="Manage your vehicle registry"
        action={
          <Button onClick={open}>
            <Plus size={16} />
            Add Vehicle
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search vehicles..."
            className="w-full sm:w-72"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'Truck', label: 'Truck' },
              { value: 'Van', label: 'Van' },
              { value: 'Bus', label: 'Bus' },
              { value: 'SUV', label: 'SUV' },
              { value: 'Sedan', label: 'Sedan' },
            ]}
            className="w-36"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'In Shop', label: 'In Shop' },
              { value: 'Retired', label: 'Retired' },
            ]}
            className="w-40"
          />
        </div>
      </Card>

      <Card>
        <DataTable
          columns={[
            { key: 'registrationNumber', label: 'Reg. Number', render: (v) => <span className="font-mono text-xs">{v.registrationNumber}</span> },
            { key: 'vehicleName', label: 'Vehicle Name', render: (v) => <span className="font-medium text-zinc-100">{v.vehicleName}</span> },
            { key: 'vehicleType', label: 'Type' },
            { key: 'capacity', label: 'Capacity (kg)', render: (v) => formatNumber(v.capacity) },
            { key: 'odometer', label: 'Odometer', render: (v) => `${formatNumber(v.odometer)} km` },
            { key: 'acquisitionCost', label: 'Cost', render: (v) => formatCurrency(v.acquisitionCost) },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v.status} /> },
          ]}
          data={displayVehicles}
          keyExtractor={(v) => v.id}
          emptyMessage="No vehicles found"
        />
      </Card>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isOpen} onClose={close} title="Add New Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <Input name="registrationNumber" label="Registration Number" placeholder="TN-01-XX-0000" required />
          <Input name="vehicleName" label="Vehicle Name" placeholder="e.g., Tata Ace Gold" required />
          <Select
            name="vehicleType"
            label="Vehicle Type"
            options={[
              { value: 'Truck', label: 'Truck' },
              { value: 'Van', label: 'Van' },
              { value: 'Bus', label: 'Bus' },
              { value: 'SUV', label: 'SUV' },
              { value: 'Sedan', label: 'Sedan' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input name="capacity" label="Capacity (kg)" type="number" placeholder="1000" required />
            <Input name="odometer" label="Odometer (km)" type="number" placeholder="0" required />
          </div>
          <Input name="acquisitionCost" label="Acquisition Cost (₹)" type="number" placeholder="500000" required />
          <Select
            name="status"
            label="Status"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'In Shop', label: 'In Shop' },
              { value: 'Retired', label: 'Retired' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={close}>Cancel</Button>
            <Button type="submit">Add Vehicle</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
