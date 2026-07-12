import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import { Button, Card, Input, Select } from '../components/common';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  mode: AuthMode;
}

const roleOptions = [
  { value: 'Fleet Manager', label: 'Fleet Manager' },
  { value: 'Driver', label: 'Driver' },
  { value: 'Safety Officer', label: 'Safety Officer' },
  { value: 'Financial Analyst', label: 'Financial Analyst' },
];

const accessNotes = ['Fleet Manager - Fleet, Maintenance', 'Driver - Dashboard, Trips', 'Safety Officer - Drivers, Compliance', 'Financial Analyst - Fuel, Expenses, Analytics'];

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Fleet Manager');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(82,82,91,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(39,39,42,0.2),transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[11px] text-zinc-400">
              <Sparkles size={14} className="text-zinc-300" />
              TransitOps access portal
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h1>
              <p className="text-sm text-zinc-500">
                {isLogin
                  ? 'Enter your credentials to continue.'
                  : 'Set up a new role-based account to begin using TransitOps.'}
              </p>
            </div>

            <Card className="border-zinc-800/90 bg-zinc-900/50 p-5 shadow-2xl shadow-black/25 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <Input
                    label="Full name"
                    placeholder="Arjun Patel"
                    autoComplete="name"
                    required
                  />
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="raven@transitops.in"
                  autoComplete="email"
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <label className="block text-sm font-medium text-zinc-400" htmlFor="password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {showPassword ? 'Hide password' : 'Show password'}
                    </button>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>

                {!isLogin && (
                  <Input
                    label="Confirm password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                )}

                <Select
                  label="Role (RBAC)"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  options={roleOptions}
                />

                {isLogin && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-zinc-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-zinc-500"
                      />
                      Remember me
                    </label>
                    <a href="#" className="text-zinc-400 transition-colors hover:text-zinc-100">
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-between text-sm text-zinc-400">
                <span>{isLogin ? 'New to TransitOps?' : 'Already have an account?'}</span>
                <button
                  type="button"
                  onClick={() => navigate(isLogin ? '/signup' : '/login')}
                  className="font-medium text-zinc-100 transition-colors hover:text-zinc-300"
                >
                  {isLogin ? 'Create account' : 'Sign in'}
                </button>
              </div>
            </Card>

            <div className="max-w-xl space-y-2 pl-1 text-sm text-zinc-500">
              <p className="font-medium text-zinc-400">Access is scoped by role after login:</p>
              <div className="space-y-1.5">
                {accessNotes.map((note) => (
                  <div key={note} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:pt-14">
            <Card className="relative border-dashed border-rose-400/70 bg-zinc-900/40 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-start gap-3 text-rose-300">
                <XCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-rose-200">Error state</p>
                  <p className="mt-1 text-sm leading-6 text-rose-200/90">
                    Invalid credentials. Account locked after 5 failed attempts.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/55 p-4 text-sm text-zinc-400">
                <p className="mb-1 font-medium text-zinc-300">Selected role</p>
                <p className="text-zinc-400">{role}</p>
              </div>

              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/55 p-4 text-sm text-zinc-400">
                <p className="mb-1 font-medium text-zinc-300">Session behavior</p>
                <p>
                  {isLogin
                    ? `Remember me is ${rememberMe ? 'enabled' : 'disabled'}.`
                    : 'Signup is frontend-only and moves you straight to the dashboard.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}