import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Lightbulb,
  Timer,
  Users,
  XCircle,
} from 'lucide-react';
import { DEPARTMENTS, type Department } from '../../types';
import { useAppStore } from '../../store/app';
import { getUser, userName } from '../../data/users';
import { StatusBadge } from '../../components/StatusBadge';
import { daysBetween, formatDate, formatINRCompact } from '../../utils/format';
import { CHART_AXIS, CHART_GRID } from '../../utils/chartColors';

const DEPT_SHORT: Record<Department, string> = {
  'Research & Development': 'R&D',
  Sourcing: 'Sourcing',
  Purchase: 'Purchase',
  Quality: 'Quality',
  Process: 'Process',
  Supplier: 'Supplier',
};
const EXTERNAL_LABEL = 'External';

const APPROVED_STATUSES = ['Feasible', 'In Execution', 'Implemented', 'Verified'];

// Pipeline funnel stages, in flow order, with their status color.
const FUNNEL_STAGES: { status: string; label: string; color: string }[] = [
  { status: 'Pending Validation', label: 'Pending', color: '#B0782B' },
  { status: 'Feasible', label: 'Feasible', color: '#C6704A' },
  { status: 'In Execution', label: 'In Execution', color: '#5A6E8C' },
  { status: 'Implemented', label: 'Implemented', color: '#6E5C74' },
  { status: 'Verified', label: 'Verified', color: '#4E7358' },
];

const MEDALS = ['#C9963B', '#AE9F8E', '#8C5E1E']; // gold, silver, bronze

function rateColor(rate: number): string {
  if (rate >= 60) return 'text-emerald-600';
  if (rate >= 40) return 'text-amber-600';
  return 'text-red-600';
}

interface QualityRow {
  source: string;
  full: string;
  approved: number;
  rejected: number;
  total: number;
}

function QualityTooltip({ active, payload }: { active?: boolean; payload?: { payload: QualityRow }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const rate = d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs shadow-lifted">
      <p className="font-semibold text-slate-800">{d.full}</p>
      <p className="mt-1 text-slate-600">Submitted: {d.total}</p>
      <p className="text-teal-700">Approved: {d.approved}</p>
      <p className="text-red-600">Rejected: {d.rejected}</p>
      <p className="mt-1 font-medium text-slate-700">Approval rate: {rate}%</p>
    </div>
  );
}

/** CI module dashboard — pipeline, contributor, and submission-quality analytics. */
export function CiDashboard() {
  const ideas = useAppStore((s) => s.ideas);
  const navigate = useNavigate();

  // ── KPI values ────────────────────────────────────────────────────────────
  const total = ideas.length;
  const pending = ideas.filter((i) => i.status === 'Pending Validation').length;
  const approved = ideas.filter((i) => APPROVED_STATUSES.includes(i.status)).length;
  const rejected = ideas.filter((i) => i.status === 'Not Feasible').length;
  const decided = ideas.filter((i) => i.status !== 'Pending Validation').length;
  const rejectionRate = decided > 0 ? (rejected / decided) * 100 : 0;
  const uniqueSubmitters = new Set(ideas.map((i) => i.submittedBy)).size;
  const avgPerSubmitter = uniqueSubmitters > 0 ? total / uniqueSubmitters : 0;
  const validatedIdeas = ideas.filter((i) => i.validation);
  const avgTurnaround =
    validatedIdeas.length > 0
      ? validatedIdeas.reduce((s, i) => s + daysBetween(i.createdAt, i.validation!.validatedAt), 0) /
        validatedIdeas.length
      : 0;
  const expectedPipeline = ideas
    .filter((i) => APPROVED_STATUSES.includes(i.status))
    .reduce((s, i) => s + i.expectedImpact.expectedAnnualSaving, 0);

  const kpis = [
    { label: 'Total ideas submitted', value: String(total), sub: 'All time', icon: Lightbulb, iconCls: 'bg-slate-100 text-slate-600', valueCls: 'text-slate-900', cardCls: '' },
    {
      label: 'Pending review',
      value: String(pending),
      sub: 'Awaiting validator action',
      icon: Clock3,
      iconCls: 'bg-amber-50 text-amber-600',
      valueCls: 'text-slate-900',
      cardCls: pending > 0 ? 'ring-2 ring-amber-300/70 animate-pulse' : '',
    },
    { label: 'Approved (Feasible+)', value: String(approved), sub: 'Feasible or beyond', icon: CheckCircle2, iconCls: 'bg-teal-50 text-teal-700', valueCls: 'text-slate-900', cardCls: '' },
    {
      label: 'Rejection rate',
      value: `${rejectionRate.toFixed(1)}%`,
      sub: 'Of decided ideas',
      icon: XCircle,
      iconCls: rejectionRate > 30 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600',
      valueCls: rejectionRate > 30 ? 'text-red-600' : 'text-slate-900',
      cardCls: '',
    },
    { label: 'Active submitters', value: String(uniqueSubmitters), sub: 'Unique contributors', icon: Users, iconCls: 'bg-blue-50 text-blue-700', valueCls: 'text-slate-900', cardCls: '' },
    { label: 'Avg ideas / submitter', value: avgPerSubmitter.toFixed(1), sub: 'Engagement index', icon: BarChart2, iconCls: 'bg-indigo-50 text-indigo-600', valueCls: 'text-slate-900', cardCls: '' },
    { label: 'Avg validation turnaround', value: `${avgTurnaround.toFixed(1)} days`, sub: 'Submission to decision', icon: Timer, iconCls: 'bg-purple-50 text-purple-600', valueCls: 'text-slate-900', cardCls: '' },
    { label: 'Expected annual saving', value: formatINRCompact(expectedPipeline), sub: 'Approved pipeline value', icon: IndianRupee, iconCls: 'bg-emerald-50 text-emerald-700', valueCls: 'text-emerald-700', cardCls: '' },
  ];

  // ── Funnel with ₹ value per stage ─────────────────────────────────────────
  const funnel = useMemo(
    () =>
      FUNNEL_STAGES.map((s) => {
        const list = ideas.filter((i) => i.status === s.status);
        return {
          ...s,
          count: list.length,
          value: list.reduce((sum, i) => sum + i.expectedImpact.expectedAnnualSaving, 0),
        };
      }),
    [ideas]
  );

  // ── Submitter leaderboard ─────────────────────────────────────────────────
  const leaderboard = useMemo(() => {
    const map = new Map<string, { name: string; orgDept: string; total: number; approved: number; saving: number }>();
    for (const i of ideas) {
      const u = getUser(i.submittedBy);
      const entry =
        map.get(i.submittedBy) ??
        { name: userName(i.submittedBy), orgDept: u?.organization ?? u?.department ?? 'External Vendor', total: 0, approved: 0, saving: 0 };
      entry.total += 1;
      if (APPROVED_STATUSES.includes(i.status)) {
        entry.approved += 1;
        entry.saving += i.expectedImpact.expectedAnnualSaving;
      }
      map.set(i.submittedBy, entry);
    }
    return [...map.values()]
      .sort((a, b) => b.approved - a.approved || b.total - a.total)
      .slice(0, 8);
  }, [ideas]);

  // ── Submission quality by source (stacked bar) ────────────────────────────
  const bySource = useMemo(() => {
    const rows: QualityRow[] = DEPARTMENTS.map((dept) => {
      const list = ideas.filter((i) => i.department === dept);
      return {
        source: DEPT_SHORT[dept],
        full: dept as string,
        approved: list.filter((i) => APPROVED_STATUSES.includes(i.status)).length,
        rejected: list.filter((i) => i.status === 'Not Feasible').length,
        total: list.length,
      };
    });
    const ext = ideas.filter((i) => !i.department);
    if (ext.length > 0) {
      rows.push({
        source: EXTERNAL_LABEL,
        full: 'External Vendor',
        approved: ext.filter((i) => APPROVED_STATUSES.includes(i.status)).length,
        rejected: ext.filter((i) => i.status === 'Not Feasible').length,
        total: ext.length,
      });
    }
    return rows.sort((a, b) => b.approved - a.approved);
  }, [ideas]);

  // ── Recent submissions (last 6, newest first) ─────────────────────────────
  const recent = useMemo(
    () => [...ideas].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [ideas]
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          COIN <span className="text-slate-300">→</span> <span className="font-medium text-primary">CI: Cost Innovation</span>
        </p>
        <Link to="/coin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} />
          Back to COIN
        </Link>
      </div>

      {/* Hero — approved pipeline value */}
      <div className="max-w-sm rounded-xl bg-primary-dark p-6 text-white shadow-card">
        <div className="flex items-center gap-2 text-teal-200/80">
          <IndianRupee size={16} />
          <p className="text-xs font-medium uppercase tracking-wider">Expected annual saving · approved pipeline</p>
        </div>
        <p className="mt-3 text-4xl font-semibold tracking-tight">{formatINRCompact(expectedPipeline)}</p>
        <p className="mt-2 text-sm text-teal-100/70">
          Projected annualized savings from {approved} approved idea{approved !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Section 1 — KPI strip (2 rows of 4) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, iconCls, valueCls, cardCls }) => (
          <div key={label} className={`card p-4 ${cardCls}`}>
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

      {/* Section 2 — Pipeline funnel */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800">Pipeline funnel</h3>
        <p className="mt-0.5 text-xs text-slate-400">Ideas and expected ₹ value at each stage</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-1.5">
          {funnel.map((stage) => (
            <div
              key={stage.status}
              className="flex items-center justify-between rounded-lg px-4 py-3 text-white sm:flex-col sm:items-start sm:justify-center"
              style={{ background: stage.color, flexGrow: Math.max(stage.count, 0.4), flexBasis: 0 }}
            >
              <span className="text-2xl font-bold leading-none">{stage.count}</span>
              <span className="text-xs font-medium opacity-90 sm:mt-1">{stage.label}</span>
              <span className="text-[10px] font-medium opacity-75 sm:mt-0.5">{formatINRCompact(stage.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Submitter leaderboard */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800">Top Contributors</h3>
        <p className="mt-0.5 text-xs text-slate-400">Ranked by approved ideas (Feasible or beyond)</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-medium">Rank</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Org / Dept</th>
                <th className="px-3 py-2 text-right font-medium">Submitted</th>
                <th className="px-3 py-2 text-right font-medium">Approved</th>
                <th className="px-3 py-2 text-right font-medium">Approval %</th>
                <th className="px-3 py-2 text-right font-medium">Pipeline ₹</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, idx) => {
                const rate = row.total > 0 ? (row.approved / row.total) * 100 : 0;
                return (
                  <tr key={row.name + idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        {idx < 3 && <span className="h-2.5 w-2.5 rounded-full" style={{ background: MEDALS[idx] }} />}
                        <span className="font-medium text-slate-600">{idx + 1}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{row.name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.orgDept}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">{row.total}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-teal-700">{row.approved}</td>
                    <td className={`px-3 py-2.5 text-right font-semibold ${rateColor(rate)}`}>{rate.toFixed(0)}%</td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-800">{formatINRCompact(row.saving)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4 — Submission quality by source */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800">Submission Quality by Source</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Which departments are raising meaningful ideas vs high-rejection sources
        </p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={Math.max(220, bySource.length * 42)}>
            <BarChart data={bySource} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="source" width={80} tick={{ fontSize: 12, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
              <Tooltip content={<QualityTooltip />} cursor={{ fill: 'rgba(198,112,74,0.07)' }} />
              <Bar dataKey="approved" name="Approved" stackId="q" fill="#4E7358" barSize={22} radius={[0, 0, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" stackId="q" fill="#B24A34" barSize={22} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-700" /> Approved</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Rejected</span>
        </div>
      </div>

      {/* Section 5 — Recent submissions */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Recent submissions</h3>
            <p className="mt-0.5 text-xs text-slate-400">Latest ideas across the pipeline</p>
          </div>
          <Link to="/ci/all-ideas" className="text-sm font-medium text-primary hover:text-primary-dark">
            View all →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {recent.map((idea) => (
            <li
              key={idea.id}
              className="flex cursor-pointer items-center gap-3 py-3 transition-colors hover:bg-slate-50/60"
              onClick={() => navigate(`/ideas/${idea.id}`)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  <span className="mr-2 font-mono text-xs text-slate-400">{idea.id}</span>
                  {idea.title}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {userName(idea.submittedBy)} · {idea.department ?? idea.organization ?? 'External Vendor'} ·{' '}
                  {idea.costInnovationType}
                </p>
              </div>
              <div className="hidden sm:block">
                <StatusBadge status={idea.status} />
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatDate(idea.createdAt)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
