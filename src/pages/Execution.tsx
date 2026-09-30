import { useMemo, useState } from 'react';
import { CheckCircle2, ListChecks, Play } from 'lucide-react';
import { TASK_PRIORITIES, type Idea, type TaskPriority } from '../types';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { useToastStore } from '../store/toast';
import { USERS, userName } from '../data/users';
import { PriorityBadge } from '../components/StatusBadge';
import { CenterModal } from '../components/CenterModal';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatINRCompact } from '../utils/format';

type Stage = 'feasible' | 'assigned' | 'inprogress' | 'completed';

const STEPS = ['Feasible', 'Assigned', 'In Progress', 'Done'];
const STAGE_RANK: Record<Stage, number> = { feasible: 0, assigned: 1, inprogress: 2, completed: 3 };

function stageOf(idea: Idea): Stage {
  const status = idea.executionTask?.status;
  if (status === 'Completed') return 'completed';
  if (status === 'In Progress') return 'inprogress';
  if (status === 'Assigned') return 'assigned';
  return 'feasible';
}

export function Execution() {
  const user = useAuthStore((s) => s.currentUser)!;
  const ideas = useAppStore((s) => s.ideas);
  const assignTask = useAppStore((s) => s.assignTask);
  const advanceTask = useAppStore((s) => s.advanceTask);
  const toast = useToastStore((s) => s.toast);

  const [assigning, setAssigning] = useState<Idea | null>(null);
  const [assignee, setAssignee] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Everything in the execution flow: feasible ideas + any idea with a task.
  const rows = useMemo(() => {
    const list = ideas.filter((i) => i.status === 'Feasible' || i.executionTask);
    return [...list].sort((a, b) => {
      const ra = STAGE_RANK[stageOf(a)];
      const rb = STAGE_RANK[stageOf(b)];
      if (ra !== rb) return ra - rb; // active stages first, completed last
      const ka = a.executionTask?.targetDate || a.createdAt;
      const kb = b.executionTask?.targetDate || b.createdAt;
      return ka.localeCompare(kb);
    });
  }, [ideas]);

  const counts = useMemo(() => {
    const c = { feasible: 0, assigned: 0, inprogress: 0, completed: 0 };
    for (const i of ideas) {
      if (i.status === 'Feasible' || i.executionTask) c[stageOf(i)] += 1;
    }
    return c;
  }, [ideas]);

  function openAssign(idea: Idea) {
    setAssigning(idea);
    setAssignee(USERS.find((u) => u.role === 'submitter' && u.department === idea.department)?.id ?? '');
    setTargetDate('');
    setPriority('Medium');
    setInstructions('');
    setErrors({});
  }

  function handleAssign() {
    if (!assigning) return;
    const errs: Record<string, string> = {};
    if (!assignee) errs.assignee = 'Choose an assignee.';
    if (!targetDate) errs.targetDate = 'Set a target date.';
    if (!instructions.trim()) errs.instructions = 'Add execution instructions.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    assignTask(assigning.id, user.id, { assignedTo: assignee, targetDate, priority, instructions: instructions.trim() });
    toast(`Task assigned to ${userName(assignee)} — ${assigning.id} is now In Execution`);
    setAssigning(null);
  }

  function handleAdvance(idea: Idea) {
    const completing = idea.executionTask!.status === 'In Progress';
    advanceTask(idea.id, user.id);
    toast(completing ? `${idea.id} marked Implemented — ready for MRN verification` : `Execution started on ${idea.id}`);
  }

  const today = new Date().toISOString().slice(0, 10);

  function renderRow(idea: Idea) {
    const stage = stageOf(idea);
    const rank = STAGE_RANK[stage];
    const task = idea.executionTask;
    const overdue = !!task && task.status !== 'Completed' && task.targetDate < today;

    // Meta line: current stage · assignee · target date
    const metaParts: string[] = [STEPS[rank] === 'Done' ? 'Completed' : STEPS[rank]];
    if (task) metaParts.push(userName(task.assignedTo));
    if (task && stage !== 'completed') metaParts.push(`target ${formatDate(task.targetDate)}`);

    return (
      <div key={idea.id} className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{idea.id}</span>
            <span className="truncate text-sm font-semibold text-slate-800">{idea.title}</span>
          </div>
          {task && (stage === 'assigned' || stage === 'inprogress') && <PriorityBadge priority={task.priority} />}
        </div>

        {/* Stage tracker */}
        <div className="mt-3 flex items-start">
          {STEPS.map((label, idx) => {
            const reached = idx <= rank;
            const connectorFilled = idx > 0 && idx <= rank;
            return (
              <div key={label} className="relative flex flex-1 flex-col items-center text-center">
                {idx > 0 && (
                  <span
                    className={`absolute right-1/2 top-[7px] h-0.5 w-full ${connectorFilled ? 'bg-primary' : 'bg-slate-200'}`}
                  />
                )}
                <span
                  className={`relative z-10 h-3.5 w-3.5 rounded-full ${
                    idx === rank ? 'bg-primary ring-4 ring-primary/15' : reached ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
                <span className={`mt-1 text-[10px] ${reached ? 'text-slate-500' : 'text-slate-300'}`}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Meta + action */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-xs ${overdue ? 'font-medium text-red-600' : 'text-slate-500'}`}>
            {metaParts.join(' · ')}
            {overdue && ' · overdue'}
          </p>

          {stage === 'feasible' && (
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => openAssign(idea)}>
              Assign →
            </button>
          )}
          {stage === 'assigned' && (
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => handleAdvance(idea)}>
              <Play size={13} /> Start →
            </button>
          )}
          {stage === 'inprogress' && (
            <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => handleAdvance(idea)}>
              <CheckCircle2 size={13} /> Complete ✓
            </button>
          )}
          {stage === 'completed' && task?.completedAt && (
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Implemented {formatDate(task.completedAt)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <p className="text-xs text-slate-500">
        {counts.feasible} ready · {counts.assigned} assigned · {counts.inprogress} in progress · {counts.completed} completed
      </p>

      {/* Progress rows */}
      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No ideas in execution"
          message="Validate ideas as feasible to bring them here for task assignment and tracking."
        />
      ) : (
        <div className="space-y-3">{rows.map(renderRow)}</div>
      )}

      {/* Assignment modal */}
      <CenterModal
        open={!!assigning}
        onClose={() => setAssigning(null)}
        title={
          assigning && (
            <div className="min-w-0">
              <p className="font-mono text-xs text-slate-400">{assigning.id}</p>
              <h3 className="truncate text-base font-semibold text-slate-900">{assigning.title}</h3>
            </div>
          )
        }
        footer={
          assigning && (
            <div className="flex items-center gap-3">
              <button className="btn-primary flex-1" onClick={handleAssign}>
                Assign Task
              </button>
              <button className="text-sm text-slate-500 hover:text-slate-700" onClick={() => setAssigning(null)}>
                Cancel
              </button>
            </div>
          )
        }
      >
        {assigning && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Expected saving</p>
              <p className="text-xl font-semibold text-teal-700">
                {formatINRCompact(assigning.expectedImpact.expectedAnnualSaving)}/yr
              </p>
            </div>

            <div>
              <label className="label">Assignee *</label>
              <select className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">Select assignee…</option>
                {USERS.filter((u) => u.role === 'submitter').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.department ?? u.organization}
                  </option>
                ))}
              </select>
              {errors.assignee && <p className="mt-1.5 text-sm text-red-600">{errors.assignee}</p>}
            </div>

            <div>
              <label className="label">Target date *</label>
              <input type="date" className="input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              {errors.targetDate && <p className="mt-1.5 text-sm text-red-600">{errors.targetDate}</p>}
            </div>

            <div>
              <label className="label">Priority</label>
              <div className="flex gap-2">
                {TASK_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      priority === p
                        ? 'border-primary bg-primary-light/40 text-primary-dark'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Instructions *</label>
              <textarea
                className="input min-h-[80px] resize-y"
                placeholder="What must be executed, validated, and documented?"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              {errors.instructions && <p className="mt-1.5 text-sm text-red-600">{errors.instructions}</p>}
            </div>
          </div>
        )}
      </CenterModal>
    </div>
  );
}
