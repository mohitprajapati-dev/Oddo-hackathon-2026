import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertTriangle, UserSearch } from 'lucide-react';
import { PageHeader, Card, DataTable, SearchBar, Button, Modal, Input, Select, StatusBadge } from '../components/common';
import { useSearch, useModal } from '../hooks';
import api from '../services/api';
import { useData } from '../context/DataContext';

interface Driver {
  id: string;
  name: string;
  email: string;
  license_number: string | null;
  license_category: string | null;
  license_expiry: string | null;
  contact_number: string | null;
  safety_score: number | null;
  status: string | null;
}

export function DriversPage() {
  const { drivers: rawDrivers, loadingDrivers, errorDrivers, fetchDrivers } = useData();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundDriver, setFoundDriver] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const { isOpen, open, close } = useModal();
  const { searchQuery, setSearchQuery, filteredItems } = useSearch<Driver>(
    drivers,
    ['name', 'email', 'license_number', 'contact_number']
  );

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    if (rawDrivers) {
      setDrivers(rawDrivers);
    }
  }, [rawDrivers]);

  const handleSearchDriver = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchError(null);
    setFoundDriver(null);
    try {
      const res = await api('GET', `api/drivers/search?email=${encodeURIComponent(searchEmail)}`);
      setFoundDriver(res.data?.data);
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || 'Driver not found');
    } finally {
      setSearching(false);
    }
  };

  const handleAddDriver = async () => {
    if (!foundDriver?.id) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await api('POST', 'api/drivers/add', { driverId: foundDriver.id });
      await fetchDrivers(true); // force refresh drivers cache
      close();
      setFoundDriver(null);
      setSearchEmail('');
    } catch (err: any) {
      setAddError(err?.response?.data?.message || err.message || 'Failed to add driver');
    } finally {
      setAddLoading(false);
    }
  };

  const handleClose = () => {
    close();
    setFoundDriver(null);
    setSearchEmail('');
    setSearchError(null);
    setAddError(null);
  };

  if (loadingDrivers) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

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

      {errorDrivers && (
        <Card className="flex items-center gap-3 border-rose-900 bg-rose-950/20 p-4 text-rose-300">
          <AlertTriangle size={18} />
          <p className="text-sm">{errorDrivers}</p>
        </Card>
      )}

      <Card className="p-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search drivers by name, email, license..."
          className="w-full sm:w-96"
        />
      </Card>

      <Card>
        <DataTable<Driver>
          columns={[
            {
              key: 'name', label: 'Driver Name', render: (d) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-xs font-bold text-white">
                    {(d.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">{d.name || '—'}</p>
                    <p className="text-xs text-zinc-500">{d.email}</p>
                  </div>
                </div>
              )
            },
            { key: 'license_number', label: 'License No.', render: (d) => <span className="font-mono text-xs">{d.license_number || '—'}</span> },
            { key: 'license_category', label: 'Category', render: (d) => <span>{d.license_category || '—'}</span> },
            {
              key: 'license_expiry', label: 'License Expiry', render: (d) => {
                if (!d.license_expiry) return <span className="text-zinc-500">—</span>;
                const expiry = new Date(d.license_expiry);
                const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const color = daysLeft <= 30 ? 'text-rose-400' : daysLeft <= 90 ? 'text-amber-400' : 'text-zinc-300';
                return <span className={color}>{expiry.toLocaleDateString('en-IN')}</span>;
              }
            },
            { key: 'contact_number', label: 'Contact', render: (d) => <span className="text-zinc-400">{d.contact_number || '—'}</span> },
            {
              key: 'safety_score', label: 'Safety Score', render: (d) => {
                const s = d.safety_score ?? 0;
                return (
                  <span className={`font-semibold ${s >= 90 ? 'text-emerald-400' : s >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                    {s}
                  </span>
                );
              }
            },
            { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status || 'Unknown'} /> },
          ]}
          data={filteredItems}
          keyExtractor={(d) => d.id}
          emptyMessage="No drivers found. Add drivers by searching their email."
        />
      </Card>

      {/* Add Driver Modal — search by email then link */}
      <Modal isOpen={isOpen} onClose={handleClose} title="Add Driver to Fleet">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Search for a registered driver by their email address. They must have already signed up with the <strong className="text-zinc-200">Driver</strong> role.
          </p>

          <div className="flex gap-2">
            <Input
              label="Driver Email"
              placeholder="driver@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-end">
              <Button onClick={handleSearchDriver} disabled={searching} variant="secondary">
                {searching ? <Loader2 size={16} className="animate-spin" /> : <UserSearch size={16} />}
                Search
              </Button>
            </div>
          </div>

          {searchError && (
            <p className="rounded-lg border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-sm text-rose-400">
              {searchError}
            </p>
          )}

          {foundDriver && (
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4 space-y-2">
              <p className="text-xs text-emerald-400 font-medium">Driver Found</p>
              <p className="text-sm font-semibold text-zinc-100">{foundDriver.name || foundDriver.driver_details?.name || '—'}</p>
              <p className="text-xs text-zinc-400">{foundDriver.email}</p>
              {foundDriver.driver_details?.license_number && (
                <p className="font-mono text-xs text-zinc-500">License: {foundDriver.driver_details.license_number}</p>
              )}
            </div>
          )}

          {addError && (
            <p className="rounded-lg border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-sm text-rose-400">
              {addError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAddDriver} disabled={!foundDriver || addLoading}>
              {addLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add to Fleet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
