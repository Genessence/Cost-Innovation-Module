import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, Clock3, IndianRupee, Lightbulb, ShieldCheck } from 'lucide-react';
import { COST_INNOVATION_TYPES, DEPARTMENTS, type CostInnovationType, type Department, type Idea } from '../types';
import { useAppStore } from '../store/app';
import { getPartCode } from '../data/partCodes';
import { daysBetween, formatDateTime, formatINRCompact, monthKey } from '../utils/format';
import { APPROVAL_COLORS, CHART_AXIS, CHART_GRID, DEPT_COLORS, TYPE_COLORS } from '../utils/chartColors';

const APPROVED_STATUSES = ['Feasible', 'In Execution', 'Implemented', 'Verified'];
const DEPT_SHORT: Record<Department, string> = {
  'Research & Development': 'R&D',
  Sourcing: 'Sourcing',
  Purchase: 'Purchase',
  Quality: 'Quality',
  Process: 'Process',
  Supplier: 'Supplier',
};

const RANGES = [
  { key: 'all', label: 'All time', months: Infinity },
  { key: '3m', label: 'Last 3 months', months: 3 },
  { key: '6m', label: 'Last 6 months', months: 6 },
  { key: '12m', label: 'Last 12 months', months: 12 },
];

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  boxShadow: '0 8px 24px rgba(15,23,42,.10)',
  fontSize: 12.5,
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function Dashboard() {
  const ideas = useAppStore((s) => s.ideas);
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CostInnovationType | 'All'>('All');
  const [range, setRange] = useState('all');

  const filtered = useMemo(() => {
    const months = RANGES.find((r) => r.key === range)?.months ?? Infinity;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - (Number.isFinite(months) ? (months as number) : 1200));
    return ideas.filter(
      (i) =>
        (deptFilter === 'All' || i.department === deptFilter) &&
        (typeFilter === 'All' || i.costInnovationType === typeFilter) &&
        new Date(i.createdAt) >= cutoff
    );
  }, [ideas, deptFilter, typeFilter, range]);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const totalSubmitted = filtered.length;
  const approvedCount = filtered.filter((i) => APPROVED_STATUSES.includes(i.status)).length;
  const verifiedIdeas = filtered.filter((i) => i.status === 'Verified');
  const implementedOrVerified = filtered.filter((i) => ['Implemented', 'Verified'].includes(i.status)).length;
  const totalVerifiedSavings = verifiedIdeas.reduce((s, i) => s + (i.mrnVerification?.actualAnnualSaving ?? 0), 0);
  const validated = filtered.filter((i) => i.validation);
  const avgTurnaround =
    validated.length > 0
      ? validated.reduce((s, i) => s + daysBetween(i.createdAt, i.validation!.validatedAt), 0) / validated.length
      : 0;

  // ── Chart data ──────────────────────────────────────────────────────────
  const perDept = useMemo(
    () =>
      DEPARTMENTS.map((dept) => ({
        dept: DEPT_SHORT[dept],
        fullDept: dept,
        ideas: filtered.filter((i) => i.department === dept).length,
      })),
    [filtered]
  );

  const approvalPerDept = useMemo(
    () =>
      DEPARTMENTS.map((dept) => {
        const list = filtered.filter((i) => i.department === dept);
        return {
          dept: DEPT_SHORT[dept],
          Approved: list.filter((i) => APPROVED_STATUSES.includes(i.status)).length,
          Rejected: list.filter((i) => i.status === 'Not Feasible').length,
          Pending: list.filter((i) => i.status === 'Pending Validation').length,
        };
      }),
    [filtered]
  );

  const monthlyTrend = useMemo(() => {
    const keys = [...new Set(filtered.map((i) => monthKey(i.createdAt)))].sort();
    return keys.map((key) => {
      const row: Record<string, string | number> = {
        month: new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      };
      for (const dept of DEPARTMENTS) {
        row[DEPT_SHORT[dept]] = filtered.filter((i) => i.department === dept && monthKey(i.createdAt) === key).length;
      }
      return row;
    });
  }, [filtered]);

  const typeBreakdown = useMemo(
    () =>
      COST_INNOVATION_TYPES.map((type) => ({
        name: type,
        value: filtered.filter((i) => i.costInnovationType === type).length,
      })).filter((d) => d.value > 0),
    [filtered]
  );

  const savingsTrend = useMemo(() => {
    const events = verifiedIdeas
      .map((i) => ({ key: monthKey(i.mrnVerification!.verifiedAt), amount: i.mrnVerification!.actualAnnualSaving }))
      .sort((a, b) => a.key.localeCompare(b.key));
    const keys = [...new Set(events.map((e) => e.key))];
    let cumulative = 0;
    return keys.map((key) => {
      cumulative += events.filter((e) => e.key === key).reduce((s, e) => s + e.amount, 0);
      return {
        month: new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        cumulative,
      };
    });
  }, [verifiedIdeas]);

  const partCodeStats = useMemo(() => {
    const map = new Map<string, { ideas: Idea[]; savings: number }>();
    for (const idea of filtered) {
      if (!['Implemented', 'Verified'].includes(idea.status)) continue;
      for (const code of idea.partCodes) {
        const entry = map.get(code) ?? { ideas: [], savings: 0 };
        entry.ideas.push(idea);
        if (idea.mrnVerification) {
          entry.savings += idea.mrnVerification.actualAnnualSaving / idea.partCodes.length;
        }
        map.set(code, entry);
      }
    }
    return [...map.entries()]
      .map(([code, { ideas: list, savings }]) => ({ code, count: list.length, savings }))
      .sort((a, b) => b.count - a.count || b.savings - a.savings)
      .slice(0, 8);
  }, [filtered]);

  const activity = useMemo(
    () =>
      filtered
        .flatMap((i) => i.timeline.map((e) => ({ ...e, ideaId: i.id, title: i.title })))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 9),
    [filtered]
  );

  const kpis = [
    { label: 'Ideas submitted', value: String(totalSubmitted), icon: Lightbulb, cls: 'bg-primary-light text-primary-dark' },
    { label: 'Ideas approved', value: String(approvedCount), icon: CheckCircle2, cls: 'bg-teal-50 text-teal-700' },
    { label: 'Implemented & verified', value: String(implementedOrVerified), icon: ShieldCheck, cls: 'bg-indigo-50 text-indigo-600' },
    { label: 'Avg validation turnaround', value: `${avgTurnaround.toFixed(1)} days`, icon: Clock3, cls: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Global filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-auto" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value as Department | 'All')}>
          <option value="All">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CostInnovationType | 'All')}>
          <option value="All">All types</option>
          {COST_INNOVATION_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r.key ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero + KPI cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-primary-dark p-6 text-white shadow-card lg:row-span-1">
          <div className="flex items-center gap-2 text-teal-200/80">
            <IndianRupee size={16} />
            <p className="text-xs font-medium uppercase tracking-wider">Total cost saved · verified via MRN</p>
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-tight">{formatINRCompact(totalVerifiedSavings)}</p>
          <p className="mt-2 text-sm text-teal-100/70">
            Annualized savings from {verifiedIdeas.length} verified idea{verifiedIdeas.length !== 1 ? 's' : ''} since
            implementation
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {kpis.map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className="card flex items-center gap-3.5 p-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${cls}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-slate-900">{value}</p>
                <p className="truncate text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Ideas raised per department" subtitle="Which department ideates the most">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perDept} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 12, fill: CHART_AXIS }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(15,118,110,0.05)' }} />
              <Bar dataKey="ideas" name="Ideas" radius={[4, 4, 0, 0]} barSize={34}>
                {perDept.map((d) => (
                  <Cell key={d.dept} fill={DEPT_COLORS[d.fullDept as Department]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Approval outcomes per department" subtitle="Whose ideas get approved the most">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={approvalPerDept} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 12, fill: CHART_AXIS }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(15,118,110,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={9} />
              <Bar dataKey="Approved" stackId="a" fill={APPROVAL_COLORS.approved} barSize={34} stroke="#fff" strokeWidth={2} />
              <Bar dataKey="Rejected" stackId="a" fill={APPROVAL_COLORS.rejected} stroke="#fff" strokeWidth={2} />
              <Bar dataKey="Pending" stackId="a" fill={APPROVAL_COLORS.pending} radius={[4, 4, 0, 0]} stroke="#fff" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Submission trend by department" subtitle="Ideas submitted per month">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={9} />
              {DEPARTMENTS.map((dept) => (
                <Line
                  key={dept}
                  type="monotone"
                  dataKey={DEPT_SHORT[dept]}
                  stroke={DEPT_COLORS[dept]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Breakdown by innovation type" subtitle="Where the ideas concentrate">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <ResponsiveContainer width="100%" height={250} className="sm:!w-1/2">
              <PieChart>
                <Pie data={typeBreakdown} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                  {typeBreakdown.map((d) => (
                    <Cell key={d.name} fill={TYPE_COLORS[d.name as CostInnovationType]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="w-full space-y-1.5 text-sm sm:w-1/2">
              {typeBreakdown
                .slice()
                .sort((a, b) => b.value - a.value)
                .map((d) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TYPE_COLORS[d.name as CostInnovationType] }} />
                    <span className="flex-1 truncate text-slate-600">{d.name}</span>
                    <span className="font-semibold text-slate-800">{d.value}</span>
                  </li>
                ))}
            </ul>
          </div>
        </ChartCard>
      </div>

      {/* Charts row 3 */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Cumulative verified savings" subtitle="Annualized ₹ locked in by MRN verification, by month">
          {savingsTrend.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No verified savings in this filter range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={savingsTrend} margin={{ top: 4, right: 8, left: 6, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                <YAxis tickFormatter={(v: number) => formatINRCompact(v)} tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatINRCompact(Number(v)), 'Cumulative savings']} />
                <Line type="monotone" dataKey="cumulative" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3.5, fill: '#0F766E' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Most-revised part codes" subtitle="Parts touched by the most implemented ideas, with attributed savings">
          {partCodeStats.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No implemented ideas in this filter range.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3 font-medium">Part code</th>
                    <th className="pb-2 pr-3 font-medium">Description</th>
                    <th className="pb-2 pr-3 text-right font-medium">Ideas</th>
                    <th className="pb-2 text-right font-medium">Verified savings</th>
                  </tr>
                </thead>
                <tbody>
                  {partCodeStats.map((row) => (
                    <tr key={row.code} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-slate-700">{row.code}</td>
                      <td className="max-w-[180px] truncate py-2.5 pr-3 text-slate-600">{getPartCode(row.code)?.description}</td>
                      <td className="py-2.5 pr-3 text-right font-semibold text-slate-800">{row.count}</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-700">
                        {row.savings > 0 ? formatINRCompact(row.savings) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Activity feed */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800">Recent activity</h3>
        <ul className="mt-4 divide-y divide-slate-100">
          {activity.map((e, idx) => (
            <li key={idx} className="flex items-center gap-3 py-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-700">
                  <span className="font-medium">{e.event}</span> — {e.actor}
                </p>
                <Link to={`/ideas/${e.ideaId}`} className="truncate text-xs text-slate-400 hover:text-primary">
                  {e.ideaId} · {e.title}
                </Link>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatDateTime(e.timestamp)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
