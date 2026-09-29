import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, KeyRound, Mail } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { USERS } from '../data/users';

export function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function landingFor(userId: string) {
    const user = USERS.find((u) => u.id === userId);
    return user?.role === 'validator' ? '/coin' : '/my-ideas';
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-dark px-6 py-12">
      <div className="w-full max-w-[420px] text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-accent/20">
            <Coins size={22} className="text-primary-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">COIN</h1>
            <p className="text-sm text-teal-200/70">Cost Optimization & Innovation Platform</p>
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
  );
}
