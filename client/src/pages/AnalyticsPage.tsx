import { Fuel, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPICard, ChartCard, PageHeader } from '../components/common';
import { analyticsKPI, monthlyRevenue, costliestVehicles, fuelEfficiencyData, operationalCostData } from '../data/analytics';
import { formatCurrency } from '../utils';

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

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Fleet performance metrics and insights" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Fuel Efficiency"
          value={`${analyticsKPI.fuelEfficiency} km/L`}
          icon={<Fuel size={20} />}
          trend={{ value: 4.2, positive: true }}
        />
        <KPICard
          title="Fleet Utilization"
          value={`${analyticsKPI.fleetUtilization}%`}
          icon={<Activity size={20} />}
          trend={{ value: 3.1, positive: true }}
        />
        <KPICard
          title="Operational Cost"
          value={formatCurrency(analyticsKPI.operationalCost)}
          icon={<DollarSign size={20} />}
          trend={{ value: 2.5, positive: false }}
        />
        <KPICard
          title="Vehicle ROI"
          value={`${analyticsKPI.vehicleROI}%`}
          icon={<TrendingUp size={20} />}
          trend={{ value: 1.8, positive: true }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly Revenue vs Cost" subtitle="12-month comparison">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(value: any) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="cost" stroke="#ef4444" fill="url(#costGrad)" strokeWidth={2} name="Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Costliest Vehicles" subtitle="Total maintenance & operational cost">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costliestVehicles} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <YAxis type="category" dataKey="vehicleName" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip {...chartTooltipStyle} formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="totalCost" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Fuel Efficiency Trend" subtitle="Monthly km/L average">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fuelEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} domain={[7, 10]} />
              <Tooltip {...chartTooltipStyle} formatter={(value: any) => `${value} km/L`} />
              <Line type="monotone" dataKey="efficiency" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} name="Efficiency" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Operational Cost Breakdown" subtitle="Monthly cost by category">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={operationalCostData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(value: any) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              <Bar dataKey="fuel" stackId="a" fill="#f59e0b" name="Fuel" radius={[0, 0, 0, 0]} />
              <Bar dataKey="maintenance" stackId="a" fill="#8b5cf6" name="Maintenance" />
              <Bar dataKey="toll" stackId="a" fill="#06b6d4" name="Toll" />
              <Bar dataKey="other" stackId="a" fill="#64748b" name="Other" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
