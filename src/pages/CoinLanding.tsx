import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Coins, Lightbulb, TrendingDown } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { formatINRCompact } from '../utils/format';

/**
 * COIN module selector — the first screen validators see after login.
 * A compact, centered two-path choice between the Cost Optimization (CO) and
 * Cost Innovation (CI) modules, with live stats pulled from the store.
 */
export function CoinLanding() {
  const user = useAuthStore((s) => s.currentUser)!;
  const ideas = useAppStore((s) => s.ideas);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const awaitingMrn = ideas.filter((i) => i.status === 'Implemented').length;
    const verifiedSavings = ideas
      .filter((i) => i.status === 'Verified')
      .reduce((sum, i) => sum + (i.mrnVerification?.actualAnnualSaving ?? 0), 0);
    const pending = ideas.filter((i) => i.status === 'Pending Validation').length;
    const inExecution = ideas.filter((i) => i.status === 'In Execution').length;
    return { awaitingMrn, verifiedSavings, pending, inExecution };
  }, [ideas]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-3xl">
        {/* Wordmark */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Coins size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">COIN</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Cost Optimization & Innovation Platform</p>
          <p className="mt-1 text-xs text-slate-400">
            Welcome, <span className="font-medium text-slate-600">{user.name}</span> · {user.designation}
          </p>
        </div>

        {/* Module cards */}
        <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-stretch">
          {/* CO — Cost Optimization */}
          <div className="w-full max-w-[340px] rounded-2xl border border-blue-200 bg-white p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingDown size={24} />
            </div>
            <span className="mt-4 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
              CO
            </span>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Cost Optimization</h2>
            <p className="text-xs text-slate-500">MRN-based savings verification</p>

            <div className="mb-4 mt-4 border-t border-slate-100" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{stats.awaitingMrn}</p>
                <p className="text-[11px] text-slate-500">Awaiting Verification</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-emerald-700">{formatINRCompact(stats.verifiedSavings)}</p>
                <p className="text-[11px] text-slate-500">Verified Savings</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/co/dashboard')}
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Enter CO <ArrowRight size={15} />
            </button>
          </div>

          {/* CI — Cost Innovation */}
          <div className="w-full max-w-[340px] rounded-2xl border border-primary/30 bg-white p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
              <Lightbulb size={24} />
            </div>
            <span className="mt-4 inline-block rounded-full bg-primary-light px-2 py-0.5 text-xs font-bold text-primary-dark">
              CI
            </span>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Cost Innovation</h2>
            <p className="text-xs text-slate-500">Idea pipeline & validation</p>

            <div className="mb-4 mt-4 border-t border-slate-100" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-amber-600">{stats.pending}</p>
                <p className="text-[11px] text-slate-500">Pending Review</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-700">{stats.inExecution}</p>
                <p className="text-[11px] text-slate-500">In Execution</p>
              </div>
            </div>

            <button onClick={() => navigate('/ci/dashboard')} className="btn-primary mt-6 w-full">
              Enter CI <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Secondary link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
          >
            Combined dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
