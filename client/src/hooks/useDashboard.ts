import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export type DashboardRole = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

export interface DashboardFilters {
  vehicle_type?: string;
  vehicle_status?: string;
  region?: string;
}

export interface DashboardState {
  loading: boolean;
  error: string | null;
  role: DashboardRole | null;
  data: any;
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    role: null,
    data: null,
  });
  const [filters, setFilters] = useState<DashboardFilters>({});

  const fetchDashboard = useCallback(async (activeFilters: DashboardFilters = {}) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams();
      if (activeFilters.vehicle_type) params.set('vehicle_type', activeFilters.vehicle_type);
      if (activeFilters.vehicle_status) params.set('vehicle_status', activeFilters.vehicle_status);
      if (activeFilters.region) params.set('region', activeFilters.region);
      
      const queryString = params.toString();
      const url = `api/dashboard/summary${queryString ? `?${queryString}` : ''}`;
      
      const res = await api('get', url);
      setState({
        loading: false,
        error: null,
        role: res.data.role as DashboardRole,
        data: res.data.data,
      });
    } catch (err: any) {
      setState({
        loading: false,
        error: err?.response?.data?.message || err.message || 'Failed to load dashboard',
        role: null,
        data: null,
      });
    }
  }, []);

  useEffect(() => {
    fetchDashboard(filters);
  }, [fetchDashboard, filters]);

  const updateFilters = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return { ...state, filters, updateFilters, clearFilters, refetch: () => fetchDashboard(filters) };
}
