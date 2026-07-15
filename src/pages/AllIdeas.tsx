import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, FileSearch, Search } from 'lucide-react';
import {
  COST_INNOVATION_TYPES,
  DEPARTMENTS,
  IDEA_STATUSES,
  type CostInnovationType,
  type Department,
  type Idea,
  type IdeaStatus,
} from '../types';
import { useAppStore } from '../store/app';
import { userName } from '../data/users';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatINRCompact } from '../utils/format';

type SortKey = 'id' | 'title' | 'department' | 'type' | 'status' | 'saving' | 'createdAt';

const SORT_ACCESSORS: Record<SortKey, (i: Idea) => string | number> = {
  id: (i) => i.id,
  title: (i) => i.title.toLowerCase(),
  department: (i) => i.department,
  type: (i) => i.costInnovationType,
  status: (i) => i.status,
  saving: (i) => i.mrnVerification?.actualAnnualSaving ?? i.expectedImpact.expectedAnnualSaving,
  createdAt: (i) => i.createdAt,
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Idea' },
  { key: 'department', label: 'Department' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'saving', label: 'Annual saving' },
  { key: 'createdAt', label: 'Submitted' },
];

export function AllIdeas() {
  const ideas = useAppStore((s) => s.ideas);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CostInnovationType | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = ideas.filter((i) => {
      if (deptFilter !== 'All' && i.department !== deptFilter) return false;
      if (statusFilter !== 'All' && i.status !== statusFilter) return false;
      if (typeFilter !== 'All' && i.costInnovationType !== typeFilter) return false;
      if (!q) return true;
      return (
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        userName(i.submittedBy).toLowerCase().includes(q) ||
        i.partCodes.some((c) => c.toLowerCase().includes(q))
      );
    });
    const accessor = SORT_ACCESSORS[sortKey];
    return [...list].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortAsc ? cmp : -cmp;
    });
  }, [ideas, search, deptFilter, statusFilter, typeFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(key === 'title' || key === 'department' || key === 'type');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by ID, title, submitter, or part code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value as Department | 'All')}>
          <option value="All">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
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
      </div>

      <p className="text-sm text-slate-500">
        {filtered.length} of {ideas.length} ideas
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={FileSearch} title="No ideas found" message="Try adjusting the search or filters." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                {COLUMNS.map(({ key, label }) => (
                  <th key={key} className="px-4 py-3 font-medium">
                    <button className="flex items-center gap-1 hover:text-slate-600" onClick={() => toggleSort(key)}>
                      {label}
                      {sortKey === key ? (
                        sortAsc ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((idea) => (
                <tr
                  key={idea.id}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-teal-50/40"
                  onClick={() => navigate(`/ideas/${idea.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-500">{idea.id}</td>
                  <td className="max-w-[300px] px-4 py-3">
                    <p className="truncate font-medium text-slate-800">{idea.title}</p>
                    <p className="truncate text-xs text-slate-400">
                      {userName(idea.submittedBy)} · {idea.partCodes.join(', ')}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{idea.department}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{idea.costInnovationType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={idea.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${idea.status === 'Verified' ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {formatINRCompact(idea.mrnVerification?.actualAnnualSaving ?? idea.expectedImpact.expectedAnnualSaving)}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">{idea.status === 'Verified' ? 'verified' : 'expected'}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(idea.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
