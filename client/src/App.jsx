import { useMemo, useState } from 'react';

const roles = [
  'Fleet Manager',
  'Dispatcher',
  'Safety Officer',
  'Financial Analyst',
];

const loginCopy = {
  title: 'Sign in to your account',
  subtitle: 'Enter your credentials to continue',
  button: 'Sign in',
  footer: 'Use your enterprise email and role to continue into the dashboard.',
};

const signupCopy = {
  title: 'Create your TransitOps account',
  subtitle: 'Set up a new workspace user for your logistics team',
  button: 'Create account',
  footer: 'Choose the role that matches your operational access after signup.',
};

function App() {
  const [mode, setMode] = useState('login');
  const [showError, setShowError] = useState(true);

  const copy = mode === 'login' ? loginCopy : signupCopy;
  const isSignup = mode === 'signup';

  const previewItems = useMemo(
    () => [
      {
        label: 'RBAC',
        title: 'Role-aware access',
        description: 'Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst flows.',
      },
      {
        label: 'Ops',
        title: 'Built for dispatch',
        description: 'Keep vehicles, drivers, and trips synchronized in real time.',
      },
    ],
    [],
  );

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="brand-row">
          <div className="brand-mark">T</div>
          <div>
            <p className="eyebrow">TransitOps</p>
            <h1>Smart transport operations, one secure login away.</h1>
          </div>
        </div>

        <p className="hero-copy">
          Manage fleet, drivers, trips, maintenance, fuel, and analytics from a single workspace designed for logistics teams.
        </p>

        <div className="feature-grid">
          {previewItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="note-card">
          <p>Secure access</p>
          <strong>Sign in or create an account to continue into TransitOps.</strong>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-frame">
          <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
            <button
              className={`switcher-btn ${mode === 'login' ? 'active' : ''}`}
              type="button"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setShowError(false);
              }}
            >
              Login
            </button>
            <button
              className={`switcher-btn ${mode === 'signup' ? 'active' : ''}`}
              type="button"
              aria-selected={mode === 'signup'}
              onClick={() => {
                setMode('signup');
                setShowError(false);
              }}
            >
              Sign up
            </button>
          </div>

          <header className="auth-header">
            <p className="auth-kicker">{copy.title}</p>
            <h2>{copy.subtitle}</h2>
          </header>

          {showError ? (
            <div className="error-banner" role="alert">
              <span className="error-icon">x</span>
              <div>
                <strong>Invalid credentials.</strong>
                <p>Account locked after 5 failed attempts.</p>
              </div>
            </div>
          ) : null}

          <form className="auth-form" noValidate>
            {isSignup ? (
              <div className="field-group">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" type="text" placeholder="Raven K" />
              </div>
            ) : null}

            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="raven.k@transitops.in" autoComplete="email" />
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Enter your password" autoComplete={isSignup ? 'new-password' : 'current-password'} />
            </div>

            <div className="field-group">
              <label htmlFor="role">Role</label>
              <div className="select-wrap">
                <select id="role" name="role" defaultValue="">
                  <option value="" disabled>
                    Select your role
                  </option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span className="select-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            {!isSignup ? (
              <div className="inline-row">
                <label className="checkbox-wrap">
                  <input id="rememberMe" type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button className="link-btn" type="button">
                  Forgot password?
                </button>
              </div>
            ) : null}

            <button className="primary-btn" type="button" onClick={() => setShowError(false)}>
              {copy.button}
            </button>

            <p className="auth-footnote">{copy.footer}</p>
          </form>

          <div className="divider" />

          <div className="access-card">
            <p>Access preview</p>
            <ul>
              <li>Fleet Manager - dashboard, vehicles, maintenance, analytics</li>
              <li>Dispatcher - vehicles, trips</li>
              <li>Safety Officer - drivers, compliance</li>
              <li>Financial Analyst - fuel, expenses, reports</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;