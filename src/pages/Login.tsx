import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, KeyRound, Mail } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { USERS } from '../data/users';
import { RoleBadge } from '../components/StatusBadge';
import { initials } from '../utils/format';
import { DEPARTMENTS } from '../types';

export function Login() {
  const login = useAuthStore((s) => s.login);
  const loginAs = useAuthStore((s) => s.loginAs);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function landingFor(userId: string) {
    const user = USERS.find((u) => u.id === userId);
    return user?.role === 'validator' ? '/dashboard' : '/my-ideas';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (login(email, password)) {
      const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())!;
      navigate(landingFor(user.id));
    } else {
      setError('Invalid email or password. Tip: every demo user’s password is demo123.');
    }
  }

  function quickLogin(userId: string) {
    loginAs(userId);
    navigate(landingFor(userId));
  }

  const validators = USERS.filter((u) => u.role === 'validator');

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[420px_1fr]">
      {/* Left: credential login */}
      <div className="flex flex-col justify-center bg-primary-dark px-8 py-12 text-white lg:min-h-screen lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-accent/20">
              <IndianRupee size={22} className="text-primary-accent" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Cost Innovation Hub</h1>
              <p className="text-sm text-teal-200/70">Ideation & Savings Portal</p>
            </div>
          </div>
          <p className="mt-8 text-sm leading-relaxed text-teal-100/80">
            Submit cost-saving ideas on manufacturing part codes, get them validated, track execution, and verify
            realized savings against quarterly MRN reports.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-teal-50">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-300/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.in"
                  className="w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-teal-200/40 focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-teal-50">Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-300/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123"
                  className="w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-teal-200/40 focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
                />
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary-accent py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:bg-teal-300"
            >
              Sign in
            </button>
            <p className="text-center text-xs text-teal-200/60">All demo accounts use password “demo123”</p>
          </form>
        </div>
      </div>

      {/* Right: quick login personas */}
      <div className="px-6 py-10 lg:overflow-y-auto lg:px-12">
        <h2 className="text-lg font-semibold text-slate-900">Quick login</h2>
        <p className="mt-1 text-sm text-slate-500">Pick any persona to enter in one click.</p>

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">Validators — upper hierarchy</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {validators.map((u) => (
            <button
              key={u.id}
              onClick={() => quickLogin(u.id)}
              className="card flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-lifted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {initials(u.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                <p className="truncate text-xs text-slate-500">{u.department}</p>
              </div>
              <RoleBadge role="validator" />
            </button>
          ))}
        </div>

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">Submitters — department users</h3>
        <div className="mt-3 space-y-5">
          {DEPARTMENTS.map((dept) => (
            <div key={dept}>
              <p className="mb-2 text-xs font-medium text-slate-500">{dept}</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {USERS.filter((u) => u.role === 'submitter' && u.department === dept).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => quickLogin(u.id)}
                    className="card flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-lifted"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                      {initials(u.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">{u.designation}</p>
                    </div>
                    <RoleBadge role="submitter" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
