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

  maintenance: any[] | null;
  loadingMaintenance: boolean;
  errorMaintenance: string | null;
  fetchMaintenance: (force?: boolean) => Promise<any[]>;

  fuel: any[] | null;
  loadingFuel: boolean;
  errorFuel: string | null;
  fetchFuel: (force?: boolean) => Promise<any[]>;

  expenses: any[] | null;
  loadingExpenses: boolean;
  errorExpenses: string | null;
  fetchExpenses: (force?: boolean) => Promise<any[]>;

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

  const [maintenance, setMaintenance] = useState<any[] | null>(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [errorMaintenance, setErrorMaintenance] = useState<string | null>(null);

  const [fuel, setFuel] = useState<any[] | null>(null);
  const [loadingFuel, setLoadingFuel] = useState(false);
  const [errorFuel, setErrorFuel] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<any[] | null>(null);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [errorExpenses, setErrorExpenses] = useState<string | null>(null);

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

  const fetchMaintenance = useCallback(async (force = false) => {
    if (!force && maintenance !== null) {
      return maintenance;
    }
    setLoadingMaintenance(true);
    setErrorMaintenance(null);
    try {
      const res = await api('GET', 'api/maintenance');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMaintenance(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch maintenance logs';
      setErrorMaintenance(msg);
      throw err;
    } finally {
      setLoadingMaintenance(false);
    }
  }, [maintenance]);

  const fetchFuel = useCallback(async (force = false) => {
    if (!force && fuel !== null) {
      return fuel;
    }
    setLoadingFuel(true);
    setErrorFuel(null);
    try {
      const res = await api('GET', 'api/fuel');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setFuel(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch fuel logs';
      setErrorFuel(msg);
      throw err;
    } finally {
      setLoadingFuel(false);
    }
  }, [fuel]);

  const fetchExpenses = useCallback(async (force = false) => {
    if (!force && expenses !== null) {
      return expenses;
    }
    setLoadingExpenses(true);
    setErrorExpenses(null);
    try {
      const res = await api('GET', 'api/expenses');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setExpenses(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch expenses';
      setErrorExpenses(msg);
      throw err;
    } finally {
      setLoadingExpenses(false);
    }
  }, [expenses]);

  const clearCache = useCallback(() => {
    setVehicles(null);
    setDrivers(null);
    setTrips(null);
    setMaintenance(null);
    setFuel(null);
    setExpenses(null);
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

        maintenance,
        loadingMaintenance,
        errorMaintenance,
        fetchMaintenance,

        fuel,
        loadingFuel,
        errorFuel,
        fetchFuel,

        expenses,
        loadingExpenses,
        errorExpenses,
        fetchExpenses,

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
