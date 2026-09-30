import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/app';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatINRCompact, formatPercent } from '../utils/format';

export function MRNVerification() {
  const ideas = useAppStore((s) => s.ideas);
  const navigate = useNavigate();

  const implemented = useMemo(
    () =>
      ideas
        .filter((i) => i.status === 'Implemented')
        .sort((a, b) => (a.executionTask?.completedAt ?? '').localeCompare(b.executionTask?.completedAt ?? '')),
    [ideas]
  );
  const verified = useMemo(
    () =>
      ideas
        .filter((i) => i.status === 'Verified')
        .sort((a, b) => (b.mrnVerification?.verifiedAt ?? '').localeCompare(a.mrnVerification?.verifiedAt ?? '')),
    [ideas]
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">MRN Verification Queue</h2>
        <p className="mt-1 text-sm text-slate-500">
          Ideas whose execution is complete and savings are ready to be confirmed against quarterly MRN data.
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Awaiting verification ({implemented.length})
        </h3>
        {implemented.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={ShieldCheck}
              title="Nothing to verify"
              message="Ideas whose execution is complete will appear here for verification against the quarterly MRN report."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            {implemented.map((idea) => (
              <div
                key={idea.id}
                className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:flex-nowrap"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" title="Implemented — awaiting verification" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{idea.id}</span>
                    <span className="truncate text-sm font-medium text-slate-800">{idea.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {idea.department ?? idea.organization ?? 'External Vendor'}
                    {idea.executionTask?.completedAt && (
                      <> · implemented {formatDate(idea.executionTask.completedAt)}</>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-teal-700">
                    {formatINRCompact(idea.expectedImpact.expectedAnnualSaving)}
                  </p>
                  <p className="text-[11px] text-slate-400">expected</p>
                </div>
                <button className="btn-secondary shrink-0 !px-3 !py-1.5 text-sm" onClick={() => navigate(`/mrn/${idea.id}`)}>
                  Review & Verify →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Verified ({verified.length})</h3>
        {verified.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
            No verified ideas yet.
          </p>
        ) : (
          <div className="card mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Idea</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Quarters</th>
                  <th className="px-5 py-3 font-medium">Realized annual saving</th>
                  <th className="px-5 py-3 font-medium">Variance</th>
                  <th className="px-5 py-3 font-medium">Verified on</th>
                </tr>
              </thead>
              <tbody>
                {verified.map((idea) => {
                  const v = idea.mrnVerification!;
                  return (
                    <tr key={idea.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <Link to={`/mrn/${idea.id}`} className="font-medium text-slate-800 hover:text-primary">
                          <span className="mr-2 font-mono text-xs text-slate-400">{idea.id}</span>
                          {idea.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{idea.department ?? idea.organization ?? 'External Vendor'}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {v.baselineQuarter} → {v.postQuarter}
                      </td>
                      <td className="px-5 py-3 font-semibold text-emerald-700">{formatINRCompact(v.actualAnnualSaving)}</td>
                      <td className={`px-5 py-3 font-medium ${v.variancePercent >= 0 ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {v.variancePercent >= 0 ? '+' : ''}
                        {formatPercent(v.variancePercent)}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(v.verifiedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
