import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  BadgeCheck,
  ShieldCheck,
  Route,
  Truck,
  ClipboardCheck,
  Star,
  Edit3,
  KeyRound,
  LogOut,
  Monitor,
  Globe,
  Clock,
} from 'lucide-react';
import { PageHeader, Card, KPICard, DataTable, Button, Badge } from '../components/common';
import { StatusBadge } from '../components/common';
import {
  profileUser,
  notificationPreferences,
  activitySummary,
  recentActivity,
  securityInfo,
  type ActivityEntry,
} from '../data/profile';

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
        enabled ? 'bg-emerald-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800/60 last:border-0">
      <span className="mt-0.5 text-zinc-500 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-0.5">{label}</p>
        <p className="text-sm text-zinc-200 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Section Card Title ───────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
      {children}
    </h3>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const [prefs, setPrefs] = useState(notificationPreferences);

  const togglePref = (id: string) => {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and preferences"
      />

      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-bold text-white shadow-lg shadow-violet-500/30 select-none">
              {profileUser.avatarInitials}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-zinc-900">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-zinc-100">
              {profileUser.firstName} {profileUser.lastName}
            </h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant="info">{profileUser.role}</Badge>
              <Badge variant="neutral">{profileUser.department}</Badge>
              <Badge variant="default">{profileUser.employeeId}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-500" />
                {profileUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-zinc-500" />
                {profileUser.phone}
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="shrink-0">
            <Button variant="secondary" size="sm">
              <Edit3 size={14} />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Two Column ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="p-5">
          <SectionTitle>
            <User size={15} className="text-violet-400" />
            Personal Information
          </SectionTitle>
          <div>
            <InfoRow icon={<User size={15} />} label="First Name" value={profileUser.firstName} />
            <InfoRow icon={<User size={15} />} label="Last Name" value={profileUser.lastName} />
            <InfoRow icon={<Mail size={15} />} label="Email" value={profileUser.email} />
            <InfoRow icon={<Phone size={15} />} label="Phone" value={profileUser.phone} />
            <InfoRow icon={<MapPin size={15} />} label="Address" value={profileUser.address} />
            <InfoRow icon={<Calendar size={15} />} label="Joining Date" value={profileUser.joiningDate} />
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="p-5">
          <SectionTitle>
            <Briefcase size={15} className="text-emerald-400" />
            Professional Information
          </SectionTitle>
          <div>
            <InfoRow icon={<BadgeCheck size={15} />} label="Role" value={profileUser.role} />
            <InfoRow icon={<Building2 size={15} />} label="Department" value={profileUser.department} />
            <InfoRow icon={<BadgeCheck size={15} />} label="Employee ID" value={profileUser.employeeId} />
            <InfoRow icon={<MapPin size={15} />} label="Office Location" value={profileUser.officeLocation} />
            <InfoRow icon={<User size={15} />} label="Reporting Manager" value={profileUser.reportingManager} />
            <InfoRow icon={<Briefcase size={15} />} label="Employment Type" value={profileUser.employmentType} />
          </div>
        </Card>
      </div>

      {/* ── Notification Preferences ───────────────────────────────────────── */}
      <Card className="p-5">
        <SectionTitle>
          <ShieldCheck size={15} className="text-amber-400" />
          Notification Preferences
        </SectionTitle>
        <div className="divide-y divide-zinc-800/60">
          {prefs.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-zinc-200">{pref.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{pref.description}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`text-xs font-medium ${pref.enabled ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {pref.enabled ? 'On' : 'Off'}
                </span>
                <Toggle enabled={pref.enabled} onChange={() => togglePref(pref.id)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Activity Summary ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Activity Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Trips Managed"
            value={activitySummary.tripsManaged}
            icon={<Route size={20} />}
            trend={{ value: 8.4, positive: true }}
          />
          <KPICard
            title="Vehicles Assigned"
            value={activitySummary.vehiclesAssigned}
            icon={<Truck size={20} />}
          />
          <KPICard
            title="Completed Tasks"
            value={activitySummary.completedTasks}
            icon={<ClipboardCheck size={20} />}
            trend={{ value: 5.1, positive: true }}
          />
          <KPICard
            title="Performance Score"
            value={activitySummary.performanceScore}
            icon={<Star size={20} />}
            trend={{ value: 2.3, positive: true }}
          />
        </div>
      </div>

      {/* ── Recent Activity ────────────────────────────────────────────────── */}
      <Card>
        <div className="border-b border-zinc-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-100">Recent Activity</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Your latest actions across the platform</p>
        </div>
        <DataTable<ActivityEntry>
          columns={[
            {
              key: 'activity',
              label: 'Activity',
              render: (row) => (
                <span className="text-zinc-200">{row.activity}</span>
              ),
            },
            {
              key: 'date',
              label: 'Date',
              render: (row) => (
                <span className="flex items-center gap-1.5 text-zinc-400 whitespace-nowrap">
                  <Clock size={12} className="text-zinc-600" />
                  {row.date}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
          data={recentActivity}
          keyExtractor={(row) => row.id}
        />
      </Card>

      {/* ── Security ───────────────────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionTitle>
          <ShieldCheck size={15} className="text-blue-400" />
          Security
        </SectionTitle>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-5">
          {/* Last Login */}
          <div className="rounded-lg bg-zinc-800/40 border border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock size={14} className="text-zinc-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Last Login</span>
            </div>
            <p className="text-sm font-medium text-zinc-200">{securityInfo.lastLogin}</p>
          </div>

          {/* Browser */}
          <div className="rounded-lg bg-zinc-800/40 border border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Globe size={14} className="text-zinc-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Browser</span>
            </div>
            <p className="text-sm font-medium text-zinc-200">{securityInfo.browser}</p>
          </div>

          {/* Device */}
          <div className="rounded-lg bg-zinc-800/40 border border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Monitor size={14} className="text-zinc-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Device</span>
            </div>
            <p className="text-sm font-medium text-zinc-200">{securityInfo.device}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">
            <KeyRound size={15} />
            Change Password
          </Button>
          <Button variant="danger">
            <LogOut size={15} />
            Logout All Devices
          </Button>
        </div>
      </Card>
    </div>
  );
}
