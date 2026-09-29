import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowLeft, Clock3, Gauge, IndianRupee, Percent, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store/app';
import { EmptyState } from '../../components/EmptyState';
import { formatDate, formatINRCompact, formatPercent } from '../../utils/format';
import { CHART_AXIS, CHART_GRID } from '../../utils/chartColors';
import { QUARTERS } from '../../data/mrnRecords';

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  boxShadow: '0 8px 24px rgba(15,23,42,.10)',
  fontSize: 12.5,
};

/** Calendar-quarter label (e.g. "Q2 2026") for an ISO timestamp. */
function quarterLabel(iso: string): string {
  const d = new Date(iso);
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
}

/** CO module dashboard — MRN-focused, analytical view of cost optimization. */
export function CoDashboard() {
  const ideas = useAppStore((s) => s.ideas);

  const verifiedIdeas = useMemo(() => ideas.filter((i) => i.status === 'Verified'), [ideas]);
  const awaiting = useMemo(
    () =>
      ideas
        .filter((i) => i.status === 'Implemented')
        .sort((a, b) => (a.executionTask?.completedAt ?? '').localeCompare(b.executionTask?.completedAt ?? '')),
    [ideas]
  );

  // ── KPI values ────────────────────────────────────────────────────────────
  const verifiedSavings = verifiedIdeas.reduce((s, i) => s + (i.mrnVerification?.actualAnnualSaving ?? 0), 0);
  const verifiedCount = verifiedIdeas.length;
  const awaitingCount = awaiting.length;
  const avgVariance =
    verifiedCount > 0
      ? verifiedIdeas.reduce((s, i) => s + (i.mrnVerification?.variancePercent ?? 0), 0) / verifiedCount
      : 0;
  const expectedPipeline = ideas
    .filter((i) => i.status === 'Implemented' || i.status === 'Verified')
    .reduce((s, i) => s + i.expectedImpact.expectedAnnualSaving, 0);
  const expectedVerified = verifiedIdeas.reduce((s, i) => s + i.expectedImpact.expectedAnnualSaving, 0);
  const realizationRate = expectedVerified > 0 ? (verifiedSavings / expectedVerified) * 100 : 0;

  const kpis = [
    {
      label: 'Verified savings',
      value: formatINRCompact(verifiedSavings),
      sub: 'Annualized · MRN confirmed',
      icon: IndianRupee,
      iconCls: 'bg-emerald-50 text-emerald-700',
      valueCls: 'text-emerald-700',
    },
    {
      label: 'Ideas verified',
      value: String(verifiedCount),
      sub: 'Savings locked in',
      icon: ShieldCheck,
      iconCls: 'bg-teal-50 text-teal-700',
      valueCls: 'text-slate-900',
    },
    {
      label: 'Awaiting MRN verification',
      value: String(awaitingCount),
      sub: 'Execution complete, not yet verified',
      icon: Clock3,
      iconCls: 'bg-amber-50 text-amber-600',
      valueCls: 'text-slate-900',
    },
    {
      label: 'Avg variance vs expected',
      value: `${avgVariance >= 0 ? '+' : ''}${formatPercent(avgVariance)}`,
      sub: 'Actual vs projected saving',
      icon: Gauge,
      iconCls: 'bg-blue-50 text-blue-700',
      valueCls: avgVariance >= 0 ? 'text-emerald-700' : 'text-red-600',
    },
    {
      label: 'Total expected saving',
      value: formatINRCompact(expectedPipeline),
      sub: 'Across implemented ideas',
      icon: TrendingUp,
      iconCls: 'bg-indigo-50 text-indigo-600',
      valueCls: 'text-slate-900',
    },
    {
      label: 'Realization rate',
      value: `${realizationRate.toFixed(1)}%`,
      sub: 'Actual ÷ Expected',
      icon: Percent,
      iconCls: 'bg-purple-50 text-purple-600',
      valueCls: 'text-purple-700',
    },
  ];

  // ── Chart 1: verified savings by quarter ──────────────────────────────────
  const byQuarter = useMemo(
    () =>
      QUARTERS.map((q) => ({
        quarter: q,
        saving: verifiedIdeas
          .filter((i) => i.mrnVerification && quarterLabel(i.mrnVerification.verifiedAt) === q)
          .reduce((s, i) => s + (i.mrnVerification?.actualAnnualSaving ?? 0), 0),
      })),
    [verifiedIdeas]
  );

  // ── Chart 2: savings realization by idea (top 8) ──────────────────────────
  const byIdea = useMemo(
    () =>
      [...verifiedIdeas]
        .sort((a, b) => (b.mrnVerification?.actualAnnualSaving ?? 0) - (a.mrnVerification?.actualAnnualSaving ?? 0))
        .slice(0, 8)
        .map((i) => ({
          id: i.id,
          saving: i.mrnVerification?.actualAnnualSaving ?? 0,
          variance: i.mrnVerification?.variancePercent ?? 0,
        })),
    [verifiedIdeas]
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          COIN <span className="text-slate-300">→</span> <span className="font-medium text-blue-700">CO: Cost Optimization</span>
        </p>
        <Link to="/coin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} />
          Back to COIN
        </Link>
      </div>

      {/* Hero — total verified savings */}
      <div className="max-w-sm rounded-xl bg-primary-dark p-6 text-white shadow-card">
        <div className="flex items-center gap-2 text-teal-200/80">
          <IndianRupee size={16} />
          <p className="text-xs font-medium uppercase tracking-wider">Total cost saved · verified via MRN</p>
        </div>
        <p className="mt-3 text-4xl font-semibold tracking-tight">{formatINRCompact(verifiedSavings)}</p>
        <p className="mt-2 text-sm text-teal-100/70">
          Annualized savings from {verifiedCount} verified idea{verifiedCount !== 1 ? 's' : ''} since implementation
        </p>
      </div>

      {/* KPI strip — 3 + 3 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, sub, icon: Icon, iconCls, valueCls }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconCls}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-semibold ${valueCls}`}>{value}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800">Verified savings by quarter</h3>
          <p className="mt-0.5 text-xs text-slate-400">Annualized ₹ confirmed against MRN each quarter</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byQuarter} margin={{ top: 4, right: 8, left: 6, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: CHART_AXIS }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(5,150,105,0.06)' }} formatter={(v) => [formatINRCompact(Number(v)), 'Verified saving']} />
                <Bar dataKey="saving" name="Verified saving" fill="#059669" radius={[4, 4, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800">Savings realization by idea</h3>
          <p className="mt-0.5 text-xs text-slate-400">Top verified ideas · teal = met/beat expected, amber = under</p>
          <div className="mt-4">
            {byIdea.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">No verified ideas yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byIdea} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="id"
                    width={104}
                    tick={{ fontSize: 11, fill: CHART_AXIS, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(15,118,110,0.05)' }} formatter={(v) => [formatINRCompact(Number(v)), 'Actual saving']} />
                  <Bar dataKey="saving" name="Actual saving" radius={[0, 4, 4, 0]} barSize={20}>
                    {byIdea.map((d) => (
                      <Cell key={d.id} fill={d.variance >= 0 ? '#0F766E' : '#D97706'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* MRN verification queue */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800">MRN verification queue</h3>
        <p className="mt-0.5 text-xs text-slate-400">Implemented ideas awaiting verification against quarterly MRN data</p>
        {awaiting.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={ShieldCheck}
              title="Nothing to verify"
              message="Implemented ideas will appear here once execution is complete."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2 font-medium">Idea ID</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Department / Org</th>
                  <th className="px-3 py-2 font-medium">Implemented on</th>
                  <th className="px-3 py-2 text-right font-medium">Expected saving</th>
                  <th className="px-3 py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {awaiting.map((idea) => (
                  <tr key={idea.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-500">{idea.id}</td>
                    <td className="max-w-[260px] px-3 py-3">
                      <span className="block truncate font-medium text-slate-800">{idea.title}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{idea.department ?? idea.organization ?? 'External Vendor'}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {idea.executionTask?.completedAt ? formatDate(idea.executionTask.completedAt) : '—'}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-teal-700">
                      {formatINRCompact(idea.expectedImpact.expectedAnnualSaving)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link to={`/mrn/${idea.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
