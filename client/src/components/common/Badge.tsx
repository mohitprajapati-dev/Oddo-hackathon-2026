import { cn } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  neutral: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const getVariant = (): BadgeProps['variant'] => {
    switch (status) {
      case 'Available':
      case 'Completed':
        return 'success';
      case 'On Trip':
      case 'Dispatched':
      case 'In Progress':
        return 'info';
      case 'In Shop':
      case 'Scheduled':
      case 'Draft':
      case 'Off Duty':
        return 'warning';
      case 'Retired':
      case 'Cancelled':
      case 'Suspended':
      case 'Overdue':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return <Badge variant={getVariant()}>{status}</Badge>;
}
