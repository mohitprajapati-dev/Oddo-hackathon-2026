import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader, Card, KPICard, DataTable, Button, Badge, Modal, Input } from '../components/common';
import { StatusBadge } from '../components/common';
import { useModal } from '../hooks';
import api from '../services/api';
import {
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
        <p className="text-sm text-zinc-200 break-words">{value || 'Not Specified'}</p>
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
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(notificationPreferences);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const editModal = useModal();

  // Edit Form Fields
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formOfficeLocation, setFormOfficeLocation] = useState('');
  const [formReportingManager, setFormReportingManager] = useState('');
  const [formEmploymentType, setFormEmploymentType] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch main user profile
      const res = await api('GET', 'api/users/profile');
      const userData = res.data?.data;
      setUser(userData);

      // Save user to localStorage to keep UI elements (Navbar/Sidebar) synchronized
      if (userData) {
        localStorage.setItem('user', JSON.stringify({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role
        }));
      }

      // Initialize form fields
      setFormFullName(userData?.full_name || '');
      setFormPhone(userData?.phone || '');
      setFormAddress(userData?.address || '');
      setFormDepartment(userData?.department || '');
      setFormOfficeLocation(userData?.office_location || '');
      setFormReportingManager(userData?.reporting_manager || '');
      setFormEmploymentType(userData?.employment_type || '');

    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditOpen = () => {
    // Sync form values again before opening
    setFormFullName(user?.full_name || '');
    setFormPhone(user?.phone || '');
    setFormAddress(user?.address || '');
    setFormDepartment(user?.department || '');
    setFormOfficeLocation(user?.office_location || '');
    setFormReportingManager(user?.reporting_manager || '');
    setFormEmploymentType(user?.employment_type || '');
    
    setSaveSuccess(false);
    setError(null);
    editModal.open();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // 1. Save main user details
      const userRes = await api('PUT', 'api/users/profile', {
        full_name: formFullName,
        phone: formPhone,
        address: formAddress,
        department: formDepartment,
        office_location: formOfficeLocation,
        reporting_manager: formReportingManager,
        employment_type: formEmploymentType,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        editModal.close();
        setSaveSuccess(false);
      }, 1000);

      // Refresh data
      fetchProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (id: string) => {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="text-sm text-zinc-400">Loading your profile...</p>
      </div>
    );
  }

  const nameParts = (user?.full_name || '').split(' ').filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const initials = nameParts
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedJoiningDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not Specified';

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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-2xl font-bold text-zinc-950 shadow-lg shadow-orange-500/30 select-none">
              {initials || '??'}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-zinc-900">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-zinc-100">
              {user?.full_name || 'Guest User'}
            </h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant="info">{user?.role || 'Guest'}</Badge>
              {user?.department && <Badge variant="neutral">{user.department}</Badge>}
              <Badge variant="default">ID: {user?.id?.slice(0, 8) || 'N/A'}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-500" />
                {user?.email || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-zinc-500" />
                {user?.phone || 'N/A'}
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="shrink-0">
            <Button variant="secondary" size="sm" onClick={handleEditOpen}>
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
            <InfoRow icon={<User size={15} />} label="First Name" value={firstName} />
            <InfoRow icon={<User size={15} />} label="Last Name" value={lastName} />
            <InfoRow icon={<Mail size={15} />} label="Email" value={user?.email || ''} />
            <InfoRow icon={<Phone size={15} />} label="Phone" value={user?.phone || ''} />
            <InfoRow icon={<MapPin size={15} />} label="Address" value={user?.address || ''} />
            <InfoRow icon={<Calendar size={15} />} label="Joining Date" value={formattedJoiningDate} />
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="p-5">
          <SectionTitle>
            <Briefcase size={15} className="text-emerald-400" />
            Professional Information
          </SectionTitle>
          <div>
            <InfoRow icon={<BadgeCheck size={15} />} label="Role" value={user?.role || ''} />
            <InfoRow icon={<Building2 size={15} />} label="Department" value={user?.department || ''} />
            <InfoRow icon={<MapPin size={15} />} label="Office Location" value={user?.office_location || ''} />
            <InfoRow icon={<User size={15} />} label="Reporting Manager" value={user?.reporting_manager || ''} />
            <InfoRow icon={<Briefcase size={15} />} label="Employment Type" value={user?.employment_type || ''} />
          </div>
        </Card>
      </div>

      {/* ── Notification Preferences ───────────────────────────────────────── */}
      {/* <Card className="p-5">
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
      </Card> */}

     
      

      {/* ── Security ───────────────────────────────────────────────────────── */}
      <Card className="p-5">
       
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">
            <KeyRound size={15} />
            Change Password
          </Button>
          <Button variant="danger" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
          }}>
            <LogOut size={15} />
            Logout
          </Button>
        </div>
      </Card>

      {/* ── Edit Profile Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Profile Details">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-950/20 p-3.5 text-sm text-red-300">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-sm text-emerald-300">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400 mt-0.5" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              type="text"
              required
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
            />
            <Input
              label="Phone"
              type="text"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          <Input
            label="Address"
            type="text"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Department"
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                />
                <Input
                  label="Office Location"
                  type="text"
                  value={formOfficeLocation}
                  onChange={(e) => setFormOfficeLocation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Reporting Manager"
                  type="text"
                  value={formReportingManager}
                  onChange={(e) => setFormReportingManager(e.target.value)}
                />
                <Input
                  label="Employment Type"
                  type="text"
                  value={formEmploymentType}
                  onChange={(e) => setFormEmploymentType(e.target.value)}
                />
              </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="secondary" type="button" onClick={editModal.close} disabled={saving}>
              Cancel
            </Button>
            <Button variant="default" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
