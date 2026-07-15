import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { useToastStore } from '../store/toast';
import { userName } from '../data/users';
import { computeMrnComparison } from '../utils/mrn';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatINR, formatINRCompact, formatPercent } from '../utils/format';

export function MRNVerification() {
  const user = useAuthStore((s) => s.currentUser)!;
  const ideas = useAppStore((s) => s.ideas);
  const verifyIdea = useAppStore((s) => s.verifyIdea);
  const toast = useToastStore((s) => s.toast);

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

  function handleVerify(ideaId: string, saving: number) {
    verifyIdea(ideaId, user.id);
    toast(`${ideaId} verified — ${formatINRCompact(saving)} annual saving locked into the dashboard`);
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Implemented — awaiting MRN verification ({implemented.length})
        </h2>
        {implemented.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={ShieldCheck}
              title="Nothing to verify"
              message="Ideas whose execution is complete will appear here for verification against the quarterly MRN report."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-5">
            {implemented.map((idea) => {
              const cmp = computeMrnComparison(idea);
              if (!cmp) return null;
              const decimals = cmp.baselineUnitCost < 10 ? 2 : 0;
              return (
                <div key={idea.id} className="card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/ideas/${idea.id}`} className="font-mono text-xs font-semibold text-slate-400 hover:text-primary">
                          {idea.id}
                        </Link>
                        <span className="text-xs text-slate-400">
                          implemented {formatDate(idea.executionTask!.completedAt!)} · {userName(idea.submittedBy)} · {idea.department}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">{idea.title}</h3>
                    </div>
                    <button className="btn-primary" onClick={() => handleVerify(idea.id, cmp.actualAnnualSaving)}>
                      <ShieldCheck size={16} /> Verify against MRN
                    </button>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                          <th className="pb-2 pr-4 font-medium">Part code</th>
                          <th className="pb-2 pr-4 font-medium">{cmp.baselineQuarter} cost</th>
                          <th className="pb-2 pr-4 font-medium">{cmp.postQuarter} cost</th>
                          <th className="pb-2 pr-4 font-medium">Qtr volume</th>
                          <th className="pb-2 font-medium">Actual annual saving</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cmp.rows.map((r) => (
                          <tr key={r.partCode} className="border-b border-slate-100 last:border-0">
                            <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-slate-700">{r.partCode}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{formatINR(r.baselineCost, decimals)}</td>
                            <td className="py-2.5 pr-4 font-medium text-slate-800">{formatINR(r.postCost, decimals)}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{r.volume.toLocaleString('en-IN')}</td>
                            <td className={`py-2.5 font-semibold ${r.annualSaving >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                              {formatINRCompact(r.annualSaving)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Expected annual saving</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">
                        {formatINRCompact(idea.expectedImpact.expectedAnnualSaving)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-700">Actual annual saving (MRN)</p>
                      <p className="mt-1 text-base font-semibold text-emerald-800">{formatINRCompact(cmp.actualAnnualSaving)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Variance vs expected</p>
                      <p className={`mt-1 text-base font-semibold ${cmp.variancePercent >= 0 ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {cmp.variancePercent >= 0 ? '+' : ''}
                        {formatPercent(cmp.variancePercent)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Unit cost delta</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">
                        {formatINR(cmp.baselineUnitCost - cmp.actualUnitCost, decimals === 2 ? 2 : 0)} / unit
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Verified ({verified.length})</h2>
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
                        <Link to={`/ideas/${idea.id}`} className="font-medium text-slate-800 hover:text-primary">
                          <span className="mr-2 font-mono text-xs text-slate-400">{idea.id}</span>
                          {idea.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{idea.department}</td>
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
