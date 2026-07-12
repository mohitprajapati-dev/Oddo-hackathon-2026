import { useState, useEffect } from 'react';
import api from '../services/api';

export type DashboardRole = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

export interface DashboardState {
  loading: boolean;
  error: string | null;
  role: DashboardRole | null;
  data: any;
}

export function useDashboard(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    role: null,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await api('get', 'api/dashboard/summary');
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            role: res.data.role as DashboardRole,
            data: res.data.data,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.response?.data?.message || err.message || 'Failed to load dashboard',
            role: null,
            data: null,
          });
        }
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, []);

  return state;
}
