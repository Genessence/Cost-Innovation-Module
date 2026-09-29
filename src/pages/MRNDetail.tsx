import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileUp,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { useToastStore } from '../store/toast';
import { getPartCode } from '../data/partCodes';
import { userName } from '../data/users';
import { computeMrnComparison } from '../utils/mrn';
import { PartCodeCard } from '../components/PartCodeCard';
import { formatDate, formatINR, formatINRCompact, formatPercent } from '../utils/format';

type StageState = 'complete' | 'current' | 'pending';

interface Stage {
  label: string;
  icon: LucideIcon;
  date: string | null;
  actor: string | null;
  remarks?: string;
  state: StageState;
}

export function MRNDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.currentUser)!;
  const idea = useAppStore((s) => s.ideas.find((i) => i.id === id));
  const verifyIdea = useAppStore((s) => s.verifyIdea);
  const toast = useToastStore((s) => s.toast);
  const navigate = useNavigate();

  if (!idea) return <Navigate to="/mrn" replace />;

  const cmp = computeMrnComparison(idea);
  // Only implemented/verified ideas have MRN data to compare.
  if (!cmp) return <Navigate to="/mrn" replace />;

  const task = idea.executionTask;
  const mrn = idea.mrnVerification;
  const isVerified = idea.status === 'Verified';

  const stages: Stage[] = [
    {
      label: 'Submitted',
      icon: FileUp,
      date: idea.createdAt,
      actor: userName(idea.submittedBy),
      state: 'complete',
    },
    {
      label: 'Validated',
      icon: UserCheck,
      date: idea.validation?.validatedAt ?? null,
      actor: idea.validation ? userName(idea.validation.validatedBy) : null,
      remarks: idea.validation?.remarks,
      state: idea.validation ? 'complete' : 'pending',
    },
    {
      label: 'Execution Assigned',
      icon: ClipboardList,
      date: task?.assignedAt ?? null,
      actor: task ? userName(task.assignedBy) : null,
      state: task?.assignedAt ? 'complete' : 'pending',
    },
    {
      label: 'Implemented',
      icon: CheckCircle2,
      date: task?.completedAt ?? null,
      actor: task ? userName(task.assignedTo) : null,
      state: isVerified ? 'complete' : task?.completedAt ? 'current' : 'pending',
    },
    {
      label: 'MRN Verified',
      icon: isVerified ? ShieldCheck : Clock3,
      date: mrn?.verifiedAt ?? null,
      actor: mrn ? userName(mrn.verifiedBy) : null,
      state: mrn ? 'complete' : 'pending',
    },
  ];

  function dotClasses(state: StageState): string {
    if (state === 'complete') return 'bg-primary text-white';
    if (state === 'current') return 'bg-amber-50 text-amber-600 ring-4 ring-amber-200 animate-pulse';
    return 'border border-dashed border-slate-300 bg-slate-100 text-slate-400';
  }

  function handleVerify() {
    verifyIdea(idea!.id, user.id);
    toast(`Saving verified — ${formatINRCompact(cmp!.actualAnnualSaving)} locked in`);
    navigate('/mrn');
  }

  const savingTotal = cmp.rows.reduce((s, r) => s + r.annualSaving, 0);
  const unitDeltaDecimals = cmp.baselineUnitCost < 10 ? 2 : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          COIN <span className="text-slate-300">→</span> CO <span className="text-slate-300">→</span> MRN Verification{' '}
          <span className="text-slate-300">→</span> <span className="font-mono font-medium text-slate-700">{idea.id}</span>
        </p>
        <Link to="/mrn" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} />
          Back to MRN Queue
        </Link>
      </div>

      {/* Section 1 — Stage timeline */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-900">Progress</h2>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const connectorFilled = idx > 0 && stages[idx - 1].state === 'complete';
            return (
              <div key={stage.label} className="relative flex flex-1 flex-col items-center text-center">
                {idx > 0 && (
                  <span
                    className={`absolute right-1/2 top-5 hidden h-0.5 w-full sm:block ${
                      connectorFilled ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                )}
                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${dotClasses(stage.state)}`}>
                  <Icon size={18} />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-800">{stage.label}</p>
                {stage.date ? (
                  <>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(stage.date)}</p>
                    {stage.actor && <p className="text-[11px] text-slate-500">{stage.actor}</p>}
                  </>
                ) : (
                  <p className="mt-0.5 text-[11px] text-slate-400">Pending</p>
                )}
                {stage.remarks && (
                  <p className="mt-1 max-w-[160px] truncate text-[11px] italic text-slate-400" title={stage.remarks}>
                    “{stage.remarks}”
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2 — Idea summary */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-xs font-semibold text-slate-400">{idea.id}</span>
          <h1 className="text-lg font-semibold text-slate-900">{idea.title}</h1>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>{userName(idea.submittedBy)}</span>
          <span>·</span>
          <span>{idea.department ?? idea.organization ?? 'External Vendor'}</span>
          <span>·</span>
          <span>{formatDate(idea.createdAt)}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {idea.costInnovationType}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{idea.description}</p>

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Linked part codes</h3>
        <div className="mt-3 space-y-2.5">
          {idea.partCodes.map((code) => {
            const part = getPartCode(code);
            return part ? <PartCodeCard key={code} part={part} compact /> : null;
          })}
        </div>
      </div>

      {/* Section 3 — MRN comparative data */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-900">Quarterly MRN Comparison</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Baseline: {cmp.baselineQuarter} → Post-implementation: {cmp.postQuarter}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-medium">Part code</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 text-right font-medium">{cmp.baselineQuarter} cost</th>
                <th className="px-3 py-2 text-right font-medium">{cmp.postQuarter} cost</th>
                <th className="px-3 py-2 text-right font-medium">Delta / unit</th>
                <th className="px-3 py-2 text-right font-medium">Qtr volume</th>
                <th className="px-3 py-2 text-right font-medium">Annualized saving</th>
              </tr>
            </thead>
            <tbody>
              {cmp.rows.map((r) => {
                const decimals = r.baselineCost < 10 ? 2 : 0;
                const delta = r.baselineCost - r.postCost;
                return (
                  <tr key={r.partCode} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold text-slate-700">{r.partCode}</td>
                    <td className="max-w-[200px] truncate px-3 py-2.5 text-slate-600">{getPartCode(r.partCode)?.description ?? '—'}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{formatINR(r.baselineCost, decimals)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-800">{formatINR(r.postCost, decimals)}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {formatINR(delta, decimals)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{r.volume.toLocaleString('en-IN')}</td>
                    <td className={`px-3 py-2.5 text-right font-semibold ${r.annualSaving >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatINRCompact(r.annualSaving)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500" colSpan={6}>
                  Total annualized saving
                </td>
                <td className={`px-3 py-2.5 text-right text-base font-semibold ${savingTotal >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {formatINRCompact(savingTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Metric tiles */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              {formatINR(cmp.baselineUnitCost - cmp.actualUnitCost, unitDeltaDecimals)} / unit
            </p>
          </div>
        </div>
      </div>

      {/* Section 4 — Verify action */}
      {isVerified && mrn ? (
        <div className="card border-l-4 border-emerald-500 bg-emerald-50/30 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <ShieldCheck size={17} /> Verified ✓
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Verified by {userName(mrn.verifiedBy)} on {formatDate(mrn.verifiedAt)}. Annual saving of{' '}
            <span className="font-semibold text-emerald-700">{formatINRCompact(mrn.actualAnnualSaving)}</span> confirmed
            against MRN data.
          </p>
        </div>
      ) : (
        <div className="card border-l-4 border-amber-400 bg-amber-50/30 p-6">
          <h2 className="text-sm font-semibold text-amber-800">Ready to verify</h2>
          <p className="mt-2 text-sm text-slate-600">
            The MRN data above confirms the saving. Click below to lock in the verified saving and move this idea to
            Verified status.
          </p>
          <button className="btn-primary mt-4 w-full sm:w-auto" onClick={handleVerify}>
            <ShieldCheck size={16} /> Confirm & Verify Saving
          </button>
        </div>
      )}
    </div>
  );
}
