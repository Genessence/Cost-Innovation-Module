import type { IdeaStatus, TaskPriority, TaskStatus } from '../types';

const STATUS_STYLES: Record<IdeaStatus, string> = {
  'Pending Validation': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Feasible: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  'Not Feasible': 'bg-red-50 text-red-700 ring-red-600/20',
  'In Execution': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Implemented: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export const STATUS_DOT_COLORS: Record<IdeaStatus, string> = {
  'Pending Validation': '#D97706',
  Feasible: '#0F766E',
  'Not Feasible': '#DC2626',
  'In Execution': '#2563EB',
  Implemented: '#4F46E5',
  Verified: '#059669',
};

export function StatusBadge({ status }: { status: IdeaStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

const TASK_STYLES: Record<TaskStatus, string> = {
  Assigned: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TASK_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  Low: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  High: 'bg-red-50 text-red-700 ring-red-600/20',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}

export function RoleBadge({ role }: { role: 'submitter' | 'validator' }) {
  return role === 'validator' ? (
    <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark ring-1 ring-inset ring-primary/20">
      Validator
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
      Submitter
    </span>
  );
}
