import { cn } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm',
        hover && 'transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80',
        className
      )}
    >
      {children}
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function KPICard({ title, value, subtitle, icon, trend, className }: KPICardProps) {
  return (
    <Card hover className={cn('p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-black/20 hover:-translate-y-0.5', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-zinc-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trend.positive ? 'text-emerald-400' : 'text-red-400')}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-zinc-800 p-2.5 text-zinc-400">{icon}</div>
      </div>
    </Card>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, className, action }: ChartCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
