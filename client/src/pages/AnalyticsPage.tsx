import { useState, useEffect, useCallback } from 'react';
import { Fuel, Activity, DollarSign, TrendingUp, Download, Loader2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPICard, ChartCard, PageHeader, Button, Card } from '../components/common';
import api from '../services/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#d4d4d8',
  },
  itemStyle: { color: '#a1a1aa' },
  labelStyle: { color: '#f4f4f5', fontWeight: 600 },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-500" />
      <p className="text-sm">Loading analytics data...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
      <p className="mb-3 text-sm text-red-400">{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

function downloadCSV(endpoint: string, filename: string) {
  const token = localStorage.getItem('token');
  const url = `${BACKEND_URL}/${endpoint}?format=csv`;
  
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    })
    .catch((err) => console.error('CSV download failed:', err));
}

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);
  const [roiData, setRoiData] = useState<any[]>([]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fuelRes, utilRes, costRes, roiRes] = await Promise.all([
        api('GET', 'api/reports/fuel-efficiency'),
        api('GET', 'api/reports/fleet-utilization'),
        api('GET', 'api/reports/operational-cost'),
        api('GET', 'api/reports/vehicle-roi'),
      ]);

      setFuelData(fuelRes.data?.data || []);
      setUtilizationData(utilRes.data?.data || {});
      setCostData(costRes.data?.data || {});
      setRoiData(roiRes.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  // Prepare chart data from real API responses
  const fuelChartData = fuelData.map((v: any) => ({
    name: v.vehicle_name || v.registration_number,
    efficiency: v.fuel_efficiency_kmpl,
    liters: v.total_liters,
    cost: v.total_fuel_cost,
  }));

  const costSummary = costData?.summary || {};
  const costBreakdownData = (costData?.vehicles || []).map((v: any) => ({
    name: v.vehicle_name || v.registration_number,
    fuel: v.fuel_cost,
    maintenance: v.maintenance_cost,
    toll: v.toll_cost,
    other: v.other_cost,
  }));

  const roiChartData = roiData.map((v: any) => ({
    vehicleName: v.vehicle_name || v.registration_number,
    totalCost: v.total_cost,
    operationalCost: v.operational_cost,
    acquisitionCost: v.acquisition_cost,
  }));

  const utilSummary = utilizationData?.summary || {};

  // KPIs
  const avgFuelEfficiency = fuelData.length > 0
    ? Math.round(fuelData.reduce((sum: number, v: any) => sum + v.fuel_efficiency_kmpl, 0) / fuelData.length * 100) / 100
    : 0;
  const totalOpCost = costSummary.grand_total || 0;
  const utilizationRate = utilSummary.utilization_rate_percent || 0;
  const avgCostPerTrip = roiData.length > 0
    ? Math.round(roiData.reduce((sum: number, v: any) => sum + v.cost_per_trip, 0) / roiData.length * 100) / 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Analytics" subtitle="Fleet performance metrics and insights — real-time data" />
        <div className="flex gap-2">
          <Button onClick={() => downloadCSV('api/reports/fuel-efficiency', 'fuel_efficiency')}>
            <Download size={14} /> Fuel CSV
          </Button>
          <Button onClick={() => downloadCSV('api/reports/operational-cost', 'operational_cost')}>
            <Download size={14} /> Cost CSV
          </Button>
          <Button onClick={() => downloadCSV('api/reports/vehicle-roi', 'vehicle_roi')}>
            <Download size={14} /> ROI CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Avg Fuel Efficiency"
          value={`${avgFuelEfficiency} km/L`}
          icon={<Fuel size={20} />}
        />
        <KPICard
          title="Fleet Utilization"
          value={`${utilizationRate}%`}
          icon={<Activity size={20} />}
        />
        <KPICard
          title="Total Operational Cost"
          value={formatCurrency(totalOpCost)}
          icon={<DollarSign size={20} />}
        />
        <KPICard
          title="Avg Cost Per Trip"
          value={formatCurrency(avgCostPerTrip)}
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Fuel Efficiency by Vehicle" subtitle="km/L per vehicle">
          {fuelChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fuelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(value: any) => `${value} km/L`} />
                <Bar dataKey="efficiency" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Efficiency (km/L)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-zinc-500 text-sm">No fuel data available</div>
          )}
        </ChartCard>

        <ChartCard title="Top Costliest Vehicles" subtitle="Total cost (acquisition + operational)">
          {roiChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={roiChartData.sort((a: any, b: any) => b.totalCost - a.totalCost).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis type="category" dataKey="vehicleName" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip {...chartTooltipStyle} formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="totalCost" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Total Cost" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-zinc-500 text-sm">No ROI data available</div>
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Fuel Consumption by Vehicle" subtitle="Total liters consumed">
          {fuelChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fuelChartData}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(value: any) => `${value} L`} />
                <Bar dataKey="liters" fill="url(#fuelGrad)" radius={[4, 4, 0, 0]} name="Liters" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-zinc-500 text-sm">No fuel data available</div>
          )}
        </ChartCard>

        <ChartCard title="Operational Cost Breakdown" subtitle="Cost by category per vehicle">
          {costBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...chartTooltipStyle} formatter={(value: any) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                <Bar dataKey="fuel" stackId="a" fill="#f59e0b" name="Fuel" radius={[0, 0, 0, 0]} />
                <Bar dataKey="maintenance" stackId="a" fill="#8b5cf6" name="Maintenance" />
                <Bar dataKey="toll" stackId="a" fill="#06b6d4" name="Toll" />
                <Bar dataKey="other" stackId="a" fill="#64748b" name="Other" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-zinc-500 text-sm">No cost data available</div>
          )}
        </ChartCard>
      </div>

      {/* Fleet Utilization Summary */}
      {utilizationData?.summary && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-zinc-100">Fleet Utilization Summary</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg bg-zinc-800/50 p-4 text-center">
              <p className="text-2xl font-bold text-zinc-100">{utilSummary.total_vehicles}</p>
              <p className="text-xs text-zinc-500">Total Vehicles</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{utilSummary.available}</p>
              <p className="text-xs text-zinc-500">Available</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{utilSummary.on_trip}</p>
              <p className="text-xs text-zinc-500">On Trip</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{utilSummary.in_shop}</p>
              <p className="text-xs text-zinc-500">In Maintenance</p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{utilSummary.retired}</p>
              <p className="text-xs text-zinc-500">Retired</p>
            </div>
            <div className="rounded-lg bg-violet-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-violet-400">{utilSummary.utilization_rate_percent}%</p>
              <p className="text-xs text-zinc-500">Utilization Rate</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
