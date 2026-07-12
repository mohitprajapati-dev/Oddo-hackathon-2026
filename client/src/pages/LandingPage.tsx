import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, BarChart3, Route, Wrench, Users, ShieldCheck,
  Fuel, ArrowRight, CheckCircle, Zap, Globe, ChevronRight,
  TrendingUp, Clock, Activity,
} from 'lucide-react';

// ── Reusable tiny components ──────────────────────────────────────────────────

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-black/30">
      <div className="mb-4 inline-flex rounded-lg bg-amber-500/10 p-3 text-amber-400 ring-1 ring-inset ring-amber-500/20 transition-all duration-300 group-hover:bg-amber-500/20">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold text-zinc-100">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center backdrop-blur-sm">
      <p className="text-3xl font-bold tracking-tight text-amber-400">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
        highlighted
          ? 'border-amber-500/50 bg-amber-500/5 shadow-xl shadow-amber-500/10'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-zinc-100">{price}</span>
          {price !== 'Custom' && <span className="text-sm text-zinc-500">/month</span>}
        </div>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </div>
      <ul className="mb-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
            <CheckCircle size={15} className="mt-0.5 shrink-0 text-amber-400" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-all duration-200 ${
          highlighted
            ? 'bg-amber-500 text-black hover:bg-amber-400'
            : 'border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrolled = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#09090b', color: '#f4f4f5' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Truck size={16} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-100">
              Transit<span className="text-amber-400">Ops</span>
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">Features</a>
            <a href="#stats" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">Stats</a>
            <a href="#pricing" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background glow blobs */}
        <div ref={heroRef} className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-amber-500/8 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-80 w-80 rounded-full bg-orange-500/6 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 h-64 w-64 rounded-full bg-amber-400/5 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400">
            <Zap size={12} />
            <span>Built for modern fleet operations</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Fleet management,
            <br />
            <GradientText>reimagined.</GradientText>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-500">
            TransitOps gives you complete control over your vehicles, drivers, trips, and costs —
            all in one powerful, beautiful platform. Real-time insights, zero guesswork.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-400 hover:shadow-amber-500/40 hover:-translate-y-0.5"
            >
              Start for free
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-7 py-3.5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/50 hover:-translate-y-0.5"
            >
              Sign in
              <ChevronRight size={16} className="text-zinc-500" />
            </Link>
          </div>

          {/* Mini dashboard preview card */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-xs text-zinc-600">transitops.app/dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              {[
                { icon: <Truck size={16} />, label: 'Total Vehicles', value: '124' },
                { icon: <Route size={16} />, label: 'Active Trips', value: '38' },
                { icon: <Users size={16} />, label: 'Drivers On Duty', value: '61' },
                { icon: <TrendingUp size={16} />, label: 'Fleet Utilization', value: '89%' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-left">
                  <div className="mb-2 flex items-center gap-1.5 text-zinc-500">
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold text-amber-400">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-zinc-800 px-4 pb-4 pt-3">
              {[
                { label: 'Mumbai → Delhi', status: 'Dispatched', driver: 'Rohit S.' },
                { label: 'Pune → Nashik', status: 'Completed', driver: 'Priya K.' },
                { label: 'Kolhapur → Satara', status: 'Pending', driver: 'Ajay M.' },
              ].map((trip) => (
                <div key={trip.label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-left">
                  <p className="mb-1 truncate text-xs font-medium text-zinc-300">{trip.label}</p>
                  <p className="text-xs text-zinc-600">{trip.driver}</p>
                  <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                    trip.status === 'Dispatched' ? 'bg-amber-500/15 text-amber-400' :
                    trip.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-zinc-700/50 text-zinc-400'
                  }`}>{trip.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section id="stats" className="border-y border-zinc-800/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard value="500+" label="Fleets Managed" />
            <StatCard value="12k+" label="Vehicles Tracked" />
            <StatCard value="98.5%" label="Uptime SLA" />
            <StatCard value="₹2.4Cr" label="Costs Saved Monthly" />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Everything you need,{' '}
              <GradientText>nothing you don't</GradientText>
            </h2>
            <p className="mx-auto max-w-xl text-zinc-500">
              From real-time trip tracking to maintenance scheduling — TransitOps covers your entire fleet lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Truck size={20} />}
              title="Fleet Management"
              description="Track every vehicle's status, odometer, acquisition cost, and service history in one unified dashboard."
            />
            <FeatureCard
              icon={<Route size={20} />}
              title="Trip Dispatch & Tracking"
              description="Dispatch trips with cargo weight, assign drivers, and track status from Pending → Dispatched → Completed."
            />
            <FeatureCard
              icon={<Users size={20} />}
              title="Driver Management"
              description="Manage your driver roster, link drivers to your fleet by email, and monitor who's currently on duty."
            />
            <FeatureCard
              icon={<Wrench size={20} />}
              title="Maintenance Logs"
              description="Log maintenance events, track costs, and mark completions. Never miss a service window again."
            />
            <FeatureCard
              icon={<Fuel size={20} />}
              title="Fuel & Expense Tracking"
              description="Log fuel refills, toll fees, and miscellaneous costs per vehicle. Understand your real operational spend."
            />
            <FeatureCard
              icon={<BarChart3 size={20} />}
              title="Analytics & Insights"
              description="Visualize trends in fleet utilization, cost breakdowns, trip volumes, and driver performance over time."
            />
            <FeatureCard
              icon={<ShieldCheck size={20} />}
              title="Role-Based Access"
              description="Fleet Managers, Drivers, Safety Officers, and Financial Analysts each get a tailored view of the data they need."
            />
            <FeatureCard
              icon={<Activity size={20} />}
              title="Real-Time Dashboard"
              description="Your operational heartbeat — active trips, vehicles in maintenance, and fleet utilization at a glance."
            />
            <FeatureCard
              icon={<Globe size={20} />}
              title="Cloud-Native"
              description="Powered by Supabase and built for scale. Your data is always accessible, always secure, anywhere."
            />
          </div>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Built for every <GradientText>stakeholder</GradientText>
            </h2>
            <p className="text-zinc-500">One platform, four powerful perspectives.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                role: 'Fleet Manager',
                color: 'amber',
                icon: <Truck size={18} />,
                perks: ['Full fleet overview', 'Dispatch trips', 'Manage drivers', 'Cost analytics'],
              },
              {
                role: 'Driver',
                color: 'sky',
                icon: <Route size={18} />,
                perks: ['View assigned trips', 'Trip history', 'Personal stats', 'Status updates'],
              },
              {
                role: 'Safety Officer',
                color: 'emerald',
                icon: <ShieldCheck size={18} />,
                perks: ['Maintenance alerts', 'Vehicle condition', 'Compliance logs', 'Safety reports'],
              },
              {
                role: 'Financial Analyst',
                color: 'violet',
                icon: <BarChart3 size={18} />,
                perks: ['Cost breakdowns', 'Expense reports', 'Operational ROI', 'Trend analysis'],
              },
            ].map((item) => (
              <div
                key={item.role}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700"
              >
                <div className={`mb-4 inline-flex rounded-lg p-2.5 text-${item.color}-400 bg-${item.color}-500/10 ring-1 ring-inset ring-${item.color}-500/20`}>
                  {item.icon}
                </div>
                <h3 className="mb-3 font-semibold text-zinc-100">{item.role}</h3>
                <ul className="space-y-2">
                  {item.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs text-zinc-500">
                      <CheckCircle size={12} className="text-amber-500/60" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Simple, <GradientText>transparent pricing</GradientText>
            </h2>
            <p className="text-zinc-500">Scale up as your fleet grows. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <PricingCard
              name="Starter"
              price="₹999"
              description="For small operators just getting started."
              features={[
                'Up to 10 vehicles',
                '5 driver accounts',
                'Basic trip management',
                'Fuel & expense logs',
                'Email support',
              ]}
            />
            <PricingCard
              name="Growth"
              price="₹2,999"
              description="For growing fleets that need more power."
              highlighted
              features={[
                'Up to 50 vehicles',
                'Unlimited drivers',
                'Full trip dispatch',
                'Analytics dashboard',
                'Role-based access',
                'Priority support',
              ]}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large operations with unique needs."
              features={[
                'Unlimited vehicles',
                'Unlimited users',
                'Custom integrations',
                'Dedicated account manager',
                'SLA guarantee',
                '24/7 support',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-orange-500/5 p-12 shadow-2xl shadow-amber-500/5">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
              <Truck size={28} className="text-white" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-zinc-100">
              Ready to take control of your fleet?
            </h2>
            <p className="mb-8 text-zinc-500">
              Join hundreds of fleet operators using TransitOps to save time, cut costs, and drive smarter.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/signup"
                className="group flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-400 hover:-translate-y-0.5"
              >
                Create free account
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/50 hover:-translate-y-0.5"
              >
                Already have an account?
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-600">
              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-amber-500/50" /> No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-amber-500/50" /> 14-day free trial</span>
              <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500/50" /> Setup in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Truck size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-100">
              Transit<span className="text-amber-400">Ops</span>
            </span>
          </div>
          <p className="text-xs text-zinc-600">© 2026 TransitOps. Built for the Odoo Hackathon 2026.</p>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Sign In</Link>
            <Link to="/signup" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
