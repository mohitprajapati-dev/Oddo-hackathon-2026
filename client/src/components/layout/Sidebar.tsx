import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Fleet', path: '/fleet', icon: Truck },
  { label: 'Drivers', path: '/drivers', icon: Users },
  { label: 'Trips', path: '/trips', icon: Route },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { label: 'Fuel & Expenses', path: '/fuel-expenses', icon: Fuel },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64',
          'max-lg:translate-x-0',
          collapsed && 'max-lg:-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
            <Truck size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight text-zinc-100">
              Transit<span className="text-amber-400">Ops</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20 shadow-sm'
                    : 'text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300',
                  collapsed && 'justify-center px-0'
                )
              }
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="hidden border-t border-zinc-800 p-3 lg:block">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800/40 hover:text-zinc-300"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
