import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lightbulb,
  Mail,
  Settings,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { USERS } from '../data/users';
import illustration from '../assets/login-illustration.png';
import amberLogo from '../assets/amber-logo.png';
import sprig from '../assets/login-sprig.png';

const STEPS: { icon: LucideIcon; label: string; caption: string }[] = [
  { icon: Lightbulb, label: 'Submit', caption: 'Capture cost-saving ideas' },
  { icon: ShieldCheck, label: 'Validate', caption: 'Get ideas approved' },
  { icon: Settings, label: 'Execute', caption: 'Track implementation' },
  { icon: TrendingUp, label: 'Verify', caption: 'Confirm realized savings' },
];

/** Small, self-contained 4-colour Google "G". */
function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src={amberLogo} alt="Amber" className={compact ? 'h-8 w-auto' : 'h-9 w-auto'} />
      <span className={`w-px bg-slate-200 ${compact ? 'h-8' : 'h-9'}`} />
      <div>
        <p className={`font-bold tracking-tight text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>COIN</p>
        <p className="text-[12px] text-slate-500">Cost Optimization &amp; Innovation Platform</p>
      </div>
    </div>
  );
}

export function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function landingFor(userId: string) {
    const user = USERS.find((u) => u.id === userId);
    return user?.role === 'validator' ? '/coin' : '/my-ideas';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNotice('');
    if (login(email, password)) {
      const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())!;
      navigate(landingFor(user.id));
    } else {
      setError('Invalid email or password. Tip: every demo user’s password is demo123.');
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Ambient background: soft peach blobs, a warm ground band, and a faint sprig */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-[34%] h-[560px] w-[640px] rounded-full bg-[#F4D8C4]/50 blur-[90px]" />
        <div className="absolute top-[24%] -left-28 h-[400px] w-[400px] rounded-full bg-[#F6DFD0]/60 blur-[80px]" />
        <div className="absolute -right-16 top-[6%] h-[440px] w-[440px] rounded-full bg-[#F1D3BE]/45 blur-[90px]" />
        <div className="absolute -bottom-48 left-1/2 h-[520px] w-[150%] -translate-x-1/2 rounded-[50%] bg-[#EBD2BD]/45 blur-[70px]" />
        <img
          src={sprig}
          alt=""
          className="absolute right-0 top-[20%] hidden h-[58%] w-auto select-none opacity-90 lg:block"
        />
      </div>

      {/* ── Left: brand story ─────────────────────────────────────────── */}
      <section className="relative hidden overflow-hidden px-12 py-12 xl:px-20 xl:py-16 lg:flex lg:flex-col lg:justify-between">
        <Brand />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-[2.9rem] font-extrabold leading-[1.08] tracking-tight text-slate-900 xl:text-6xl">
            Smarter Ideas.
            <br />
            <span className="text-primary">Greater Savings.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-500">
            Submit cost-saving ideas on manufacturing part codes, get them validated, track execution, and verify
            realized savings against quarterly MRN reports.
          </p>

          {/* Process stepper */}
          <ol className="mt-9 flex items-start">
            {STEPS.map(({ icon: Icon, label, caption }, i) => (
              <li key={label} className="flex items-start">
                <div className="w-[100px]">
                  <Icon size={22} className="text-primary" strokeWidth={1.75} />
                  <p className="mt-2.5 text-sm font-semibold text-slate-800">{label}</p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-400">{caption}</p>
                </div>
                {i < STEPS.length - 1 && <ChevronRight size={16} className="mt-1 shrink-0 text-slate-300" />}
              </li>
            ))}
          </ol>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
          <span className="h-px w-9 bg-slate-300" />
          Building a more efficient tomorrow
        </div>

        {/* Hero illustration (cropped from brand render), sits behind the text */}
        <img
          src={illustration}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 right-2 z-0 w-[42%] max-w-[440px] select-none xl:right-8"
        />
      </section>

      {/* ── Right: sign-in card ───────────────────────────────────────── */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="card w-full max-w-md p-8 shadow-lifted sm:p-9">
          <Brand compact />

          <h2 className="mt-7 text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to continue to your COIN dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.in"
                  className="input pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input px-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/15">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg bg-primary-light/70 px-3 py-2 text-sm text-primary-dark ring-1 ring-inset ring-primary/15">
                {notice}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-2.5">
              Sign in <ArrowRight size={16} />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            OR
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() =>
              setNotice('Single sign-on isn’t enabled for the demo — sign in with your email and password “demo123”.')
            }
            className="btn-secondary w-full py-2.5"
          >
            <GoogleG /> Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">Need help? Contact your administrator.</p>
        </div>
      </section>
    </div>
  );
}
