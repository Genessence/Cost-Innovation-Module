import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ClipboardList, ShieldCheck, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { getPartCode } from '../data/partCodes';
import { userName } from '../data/users';
import { StatusBadge, TaskStatusBadge, PriorityBadge } from '../components/StatusBadge';
import { PartCodeCard } from '../components/PartCodeCard';
import { ImpactGrid } from '../components/ImpactGrid';
import { Timeline } from '../components/Timeline';
import { PhotoWithLightbox } from '../components/Lightbox';
import { formatDate, formatINR, formatINRCompact, formatPercent } from '../utils/format';

export function IdeaDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.currentUser)!;
  const idea = useAppStore((s) => s.ideas.find((i) => i.id === id));

  if (!idea) {
    return <Navigate to={user.role === 'validator' ? '/all-ideas' : '/my-ideas'} replace />;
  }
  // Submitters may only open their own ideas.
  if (user.role === 'submitter' && idea.submittedBy !== user.id) {
    return <Navigate to="/my-ideas" replace />;
  }

  const backTo = user.role === 'validator' ? '/all-ideas' : '/my-ideas';
  const task = idea.executionTask;
  const mrn = idea.mrnVerification;
  const smallCost = idea.expectedImpact.currentCost < 10;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to={backTo} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="font-mono text-sm font-semibold text-slate-400">{idea.id}</span>
        <StatusBadge status={idea.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h1 className="text-xl font-semibold text-slate-900">{idea.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <UserRound size={15} /> {userName(idea.submittedBy)} · {idea.department}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} /> {formatDate(idea.createdAt)}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {idea.costInnovationType}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{idea.description}</p>
            {idea.photo && (
              <div className="mt-4 max-w-sm">
                <PhotoWithLightbox src={idea.photo} alt={idea.title} />
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-900">Linked part codes</h2>
            <div className="mt-3 space-y-3">
              {idea.partCodes.map((code) => {
                const part = getPartCode(code);
                return part ? <PartCodeCard key={code} part={part} /> : null;
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-900">Expected impact</h2>
            <div className="mt-3">
              <ImpactGrid impact={idea.expectedImpact} />
            </div>
          </div>

          {idea.validation && (
            <div className={`card border-l-4 p-6 ${idea.status === 'Not Feasible' ? 'border-l-red-400' : 'border-l-teal-500'}`}>
              <h2 className="text-sm font-semibold text-slate-900">
                Validation — {idea.status === 'Not Feasible' ? 'Not Feasible' : 'Feasible'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {userName(idea.validation.validatedBy)} · {formatDate(idea.validation.validatedAt)}
              </p>
              <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{idea.validation.remarks}</p>
            </div>
          )}

          {task && (
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ClipboardList size={16} className="text-blue-600" /> Execution task
                </h2>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-400">Assigned to</dt>
                  <dd className="text-slate-700">{userName(task.assignedTo)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Target date</dt>
                  <dd className="text-slate-700">{formatDate(task.targetDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">{task.completedAt ? 'Completed on' : 'Assigned on'}</dt>
                  <dd className="text-slate-700">{formatDate(task.completedAt ?? task.assignedAt)}</dd>
                </div>
              </dl>
              <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{task.instructions}</p>
            </div>
          )}

          {mrn && (
            <div className="card border-l-4 border-l-emerald-500 p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck size={16} className="text-emerald-600" /> MRN-verified savings
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {userName(mrn.verifiedBy)} · {formatDate(mrn.verifiedAt)} · {mrn.baselineQuarter} vs {mrn.postQuarter}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Cost before ({mrn.baselineQuarter})</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{formatINR(mrn.baselineUnitCost, smallCost ? 2 : 0)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Cost after ({mrn.postQuarter})</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{formatINR(mrn.actualUnitCost, smallCost ? 2 : 0)}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Realized annual saving</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-800">{formatINRCompact(mrn.actualAnnualSaving)}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Variance vs expected</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-800">
                    {mrn.variancePercent >= 0 ? '+' : ''}
                    {formatPercent(mrn.variancePercent)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-sm font-semibold text-slate-900">Status timeline</h2>
          <div className="mt-5">
            <Timeline events={idea.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
