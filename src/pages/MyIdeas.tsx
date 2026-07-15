import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FilePlus2, IndianRupee, Lightbulb, XCircle } from 'lucide-react';
import { COST_INNOVATION_TYPES, IDEA_STATUSES, type CostInnovationType, type IdeaStatus } from '../types';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatINRCompact } from '../utils/format';

export function MyIdeas() {
  const user = useAuthStore((s) => s.currentUser)!;
  const ideas = useAppStore((s) => s.ideas);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CostInnovationType | 'All'>('All');

  const mine = useMemo(
    () =>
      ideas
        .filter((i) => i.submittedBy === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ideas, user.id]
  );

  const filtered = mine.filter(
    (i) => (statusFilter === 'All' || i.status === statusFilter) && (typeFilter === 'All' || i.costInnovationType === typeFilter)
  );

  const approved = mine.filter((i) => ['Feasible', 'In Execution', 'Implemented', 'Verified'].includes(i.status)).length;
  const rejected = mine.filter((i) => i.status === 'Not Feasible').length;
  const mySavings = mine
    .filter((i) => i.status === 'Verified')
    .reduce((s, i) => s + (i.mrnVerification?.actualAnnualSaving ?? 0), 0);

  const stats = [
    { label: 'Ideas submitted', value: String(mine.length), icon: Lightbulb, cls: 'bg-primary-light text-primary-dark' },
    { label: 'Approved', value: String(approved), icon: CheckCircle2, cls: 'bg-teal-50 text-teal-700' },
    { label: 'Rejected', value: String(rejected), icon: XCircle, cls: 'bg-red-50 text-red-600' },
    { label: 'Verified annual savings', value: formatINRCompact(mySavings), icon: IndianRupee, cls: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, cls }) => (
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

      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as IdeaStatus | 'All')}>
          <option value="All">All statuses</option>
          {IDEA_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CostInnovationType | 'All')}>
          <option value="All">All types</option>
          {COST_INNOVATION_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <Link to="/submit" className="btn-primary ml-auto">
          <FilePlus2 size={16} /> Submit idea
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={mine.length === 0 ? 'No ideas yet' : 'Nothing matches these filters'}
          message={
            mine.length === 0
              ? 'Spot a cost-saving opportunity on a part code? Submit your first idea and track it through validation, execution, and verified savings.'
              : 'Try clearing the status or type filter.'
          }
          action={
            mine.length === 0 ? (
              <Link to="/submit" className="btn-primary">
                <FilePlus2 size={16} /> Submit your first idea
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <Link key={idea.id} to={`/ideas/${idea.id}`} className="card flex flex-col p-5 transition-shadow hover:shadow-lifted">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-slate-400">{idea.id}</span>
                <StatusBadge status={idea.status} />
              </div>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800">{idea.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{idea.description}</p>
              <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-0.5">{idea.costInnovationType}</span>
                <span>{formatDate(idea.createdAt)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-mono text-slate-400">{idea.partCodes.join(', ')}</span>
                <span className="font-semibold text-teal-700">
                  {idea.status === 'Verified'
                    ? `${formatINRCompact(idea.mrnVerification!.actualAnnualSaving)} verified`
                    : `${formatINRCompact(idea.expectedImpact.expectedAnnualSaving)} expected`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
