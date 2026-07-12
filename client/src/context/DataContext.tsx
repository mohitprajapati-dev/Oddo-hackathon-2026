import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

interface DataContextType {
  vehicles: any[] | null;
  loadingVehicles: boolean;
  errorVehicles: string | null;
  fetchVehicles: (force?: boolean) => Promise<any[]>;

  drivers: any[] | null;
  loadingDrivers: boolean;
  errorDrivers: string | null;
  fetchDrivers: (force?: boolean) => Promise<any[]>;

  trips: any[] | null;
  loadingTrips: boolean;
  errorTrips: string | null;
  fetchTrips: (force?: boolean) => Promise<any[]>;

  clearCache: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<any[] | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [errorVehicles, setErrorVehicles] = useState<string | null>(null);

  const [drivers, setDrivers] = useState<any[] | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [errorDrivers, setErrorDrivers] = useState<string | null>(null);

  const [trips, setTrips] = useState<any[] | null>(null);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [errorTrips, setErrorTrips] = useState<string | null>(null);

  const fetchVehicles = useCallback(async (force = false) => {
    if (!force && vehicles !== null) {
      return vehicles;
    }
    setLoadingVehicles(true);
    setErrorVehicles(null);
    try {
      const res = await api('GET', 'api/vehicles');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setVehicles(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch vehicles';
      setErrorVehicles(msg);
      throw err;
    } finally {
      setLoadingVehicles(false);
    }
  }, [vehicles]);

  const fetchDrivers = useCallback(async (force = false) => {
    if (!force && drivers !== null) {
      return drivers;
    }
    setLoadingDrivers(true);
    setErrorDrivers(null);
    try {
      const res = await api('GET', 'api/drivers');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDrivers(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch drivers';
      setErrorDrivers(msg);
      throw err;
    } finally {
      setLoadingDrivers(false);
    }
  }, [drivers]);

  const fetchTrips = useCallback(async (force = false) => {
    if (!force && trips !== null) {
      return trips;
    }
    setLoadingTrips(true);
    setErrorTrips(null);
    try {
      const res = await api('GET', 'api/trips');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTrips(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch trips';
      setErrorTrips(msg);
      throw err;
    } finally {
      setLoadingTrips(false);
    }
  }, [trips]);

  const clearCache = useCallback(() => {
    setVehicles(null);
    setDrivers(null);
    setTrips(null);
  }, []);

  return (
    <DataContext.Provider
      value={{
        vehicles,
        loadingVehicles,
        errorVehicles,
        fetchVehicles,

        drivers,
        loadingDrivers,
        errorDrivers,
        fetchDrivers,

        trips,
        loadingTrips,
        errorTrips,
        fetchTrips,

        clearCache,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
