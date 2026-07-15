import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ClipboardList, ListChecks, Play, UserRound, X } from 'lucide-react';
import { TASK_PRIORITIES, type Idea, type TaskPriority, type TaskStatus } from '../types';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { useToastStore } from '../store/toast';
import { USERS, userName } from '../data/users';
import { PriorityBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatINRCompact } from '../utils/format';

const COLUMNS: { status: TaskStatus; title: string; accent: string }[] = [
  { status: 'Assigned', title: 'Assigned', accent: 'border-t-slate-400' },
  { status: 'In Progress', title: 'In Progress', accent: 'border-t-blue-500' },
  { status: 'Completed', title: 'Completed', accent: 'border-t-emerald-500' },
];

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

  const feasible = useMemo(
    () => ideas.filter((i) => i.status === 'Feasible').sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [ideas]
  );
  const withTasks = useMemo(
    () =>
      ideas
        .filter((i) => i.executionTask)
        .sort((a, b) => (a.executionTask!.targetDate || '').localeCompare(b.executionTask!.targetDate || '')),
    [ideas]
  );

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
    toast(
      completing
        ? `${idea.id} marked Implemented — ready for MRN verification`
        : `Execution started on ${idea.id}`
    );
  }

  return (
    <div className="space-y-8">
      {/* Feasible ideas awaiting task assignment */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Awaiting task assignment ({feasible.length})
        </h2>
        {feasible.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
            No feasible ideas waiting. Validate ideas in the queue to bring them here.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {feasible.map((idea) => (
              <div key={idea.id} className="card flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <Link to={`/ideas/${idea.id}`} className="font-mono text-xs font-semibold text-slate-400 hover:text-primary">
                    {idea.id}
                  </Link>
                  <span className="text-xs text-slate-400">{idea.department}</span>
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-800">{idea.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatINRCompact(idea.expectedImpact.expectedAnnualSaving)} expected annual saving
                </p>
                <button className="btn-primary mt-4" onClick={() => openAssign(idea)}>
                  <ClipboardList size={15} /> Assign execution task
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Kanban */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Execution board</h2>
        {withTasks.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={ListChecks}
              title="No execution tasks yet"
              message="Assign a task on a feasible idea to start tracking execution here."
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {COLUMNS.map(({ status, title, accent }) => {
              const cards = withTasks.filter((i) => i.executionTask!.status === status);
              return (
                <div key={status} className={`rounded-xl border border-slate-200 border-t-4 bg-slate-50/60 p-3 ${accent}`}>
                  <p className="px-1 text-sm font-semibold text-slate-700">
                    {title} <span className="ml-1 text-xs font-normal text-slate-400">{cards.length}</span>
                  </p>
                  <div className="mt-3 space-y-3">
                    {cards.length === 0 && (
                      <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
                        Nothing here
                      </p>
                    )}
                    {cards.map((idea) => {
                      const task = idea.executionTask!;
                      const overdue = task.status !== 'Completed' && task.targetDate < new Date().toISOString().slice(0, 10);
                      return (
                        <div key={idea.id} className="card p-4">
                          <div className="flex items-center justify-between gap-2">
                            <Link to={`/ideas/${idea.id}`} className="font-mono text-xs font-semibold text-slate-400 hover:text-primary">
                              {idea.id}
                            </Link>
                            <PriorityBadge priority={task.priority} />
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-sm font-medium text-slate-800">{idea.title}</p>
                          <div className="mt-2.5 space-y-1 text-xs text-slate-500">
                            <p className="flex items-center gap-1.5">
                              <UserRound size={13} /> {userName(task.assignedTo)}
                            </p>
                            <p className={`flex items-center gap-1.5 ${overdue ? 'font-medium text-red-600' : ''}`}>
                              <CalendarDays size={13} /> Target {formatDate(task.targetDate)}
                              {overdue && ' · overdue'}
                            </p>
                          </div>
                          {task.status === 'Assigned' && (
                            <button className="btn-secondary mt-3 w-full !py-1.5 text-xs" onClick={() => handleAdvance(idea)}>
                              <Play size={13} /> Start execution
                            </button>
                          )}
                          {task.status === 'In Progress' && (
                            <button className="btn-primary mt-3 w-full !py-1.5 text-xs" onClick={() => handleAdvance(idea)}>
                              <CheckCircle2 size={13} /> Mark complete
                            </button>
                          )}
                          {task.status === 'Completed' && task.completedAt && (
                            <p className="mt-3 rounded-md bg-emerald-50 px-2 py-1.5 text-center text-xs text-emerald-700">
                              Implemented {formatDate(task.completedAt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Assignment modal */}
      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setAssigning(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lifted">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Assign execution task</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  <span className="font-mono">{assigning.id}</span> · {assigning.title}
                </p>
              </div>
              <button className="rounded p-1 text-slate-400 hover:bg-slate-100" onClick={() => setAssigning(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="label">Assignee *</label>
                <select className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  <option value="">Select assignee…</option>
                  {USERS.filter((u) => u.role === 'submitter').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department}
                    </option>
                  ))}
                </select>
                {errors.assignee && <p className="mt-1.5 text-sm text-red-600">{errors.assignee}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Target date *</label>
                  <input type="date" className="input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                  {errors.targetDate && <p className="mt-1.5 text-sm text-red-600">{errors.targetDate}</p>}
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Instructions *</label>
                <textarea
                  className="input min-h-[90px] resize-y"
                  placeholder="What must be executed, validated, and documented?"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
                {errors.instructions && <p className="mt-1.5 text-sm text-red-600">{errors.instructions}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button className="btn-secondary" onClick={() => setAssigning(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAssign}>
                Assign task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
