import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Inbox, XCircle } from 'lucide-react';
import { COST_INNOVATION_TYPES, DEPARTMENTS, type CostInnovationType, type Department, type Validation } from '../types';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { useToastStore } from '../store/toast';
import { getPartCode } from '../data/partCodes';
import { userName } from '../data/users';
import { PartCodeCard } from '../components/PartCodeCard';
import { ImpactGrid } from '../components/ImpactGrid';
import { PhotoWithLightbox } from '../components/Lightbox';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatINRCompact } from '../utils/format';

const CHECKLIST_ITEMS: { key: keyof Validation['checklist']; label: string; hint: string }[] = [
  { key: 'technicalFeasibility', label: 'Technical feasibility', hint: 'Change can be engineered and validated' },
  { key: 'costCredibility', label: 'Cost credibility', hint: 'Savings estimate is backed by quotes / data' },
  { key: 'implementationComplexity', label: 'Implementation complexity acceptable', hint: 'Effort and timeline are reasonable' },
  { key: 'riskAcceptable', label: 'Risk acceptable', hint: 'No unacceptable quality / reliability / supply risk' },
];

const DEFAULT_CHECKLIST: Validation['checklist'] = {
  technicalFeasibility: true,
  costCredibility: true,
  implementationComplexity: true,
  riskAcceptable: true,
};

export function ValidationQueue() {
  const user = useAuthStore((s) => s.currentUser)!;
  const ideas = useAppStore((s) => s.ideas);
  const validateIdea = useAppStore((s) => s.validateIdea);
  const rejectIdea = useAppStore((s) => s.rejectIdea);
  const toast = useToastStore((s) => s.toast);

  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CostInnovationType | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Validation['checklist']>(DEFAULT_CHECKLIST);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [confirmReject, setConfirmReject] = useState(false);

  const queue = useMemo(
    () =>
      ideas
        .filter((i) => i.status === 'Pending Validation')
        .filter((i) => (deptFilter === 'All' || i.department === deptFilter) && (typeFilter === 'All' || i.costInnovationType === typeFilter))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [ideas, deptFilter, typeFilter]
  );

  const selected = queue.find((i) => i.id === selectedId) ?? queue[0] ?? null;

  function resetPanel() {
    setChecklist(DEFAULT_CHECKLIST);
    setRemarks('');
    setRemarksError('');
  }

  function selectIdea(id: string) {
    setSelectedId(id);
    resetPanel();
  }

  function handleValidate() {
    if (!selected) return;
    validateIdea(selected.id, user.id, checklist, remarks.trim() || 'Validated as feasible.');
    toast(`${selected.id} marked Feasible — ready for task assignment`);
    setSelectedId(null);
    resetPanel();
  }

  function handleRejectClick() {
    if (!remarks.trim()) {
      setRemarksError('Remarks are mandatory when rejecting an idea.');
      return;
    }
    setRemarksError('');
    setConfirmReject(true);
  }

  function handleRejectConfirm() {
    if (!selected) return;
    rejectIdea(selected.id, user.id, checklist, remarks.trim());
    toast(`${selected.id} marked Not Feasible`, 'info');
    setConfirmReject(false);
    setSelectedId(null);
    resetPanel();
  }

  if (ideas.filter((i) => i.status === 'Pending Validation').length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Queue is clear"
        message="No ideas are pending validation right now. New submissions will land here automatically."
      />
    );
  }

  return (
    <div className="space-y-4">
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
        <span className="ml-auto text-sm text-slate-500">
          {queue.length} idea{queue.length !== 1 ? 's' : ''} in queue
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        {/* Queue list */}
        <div className="space-y-2.5 xl:max-h-[calc(100vh-180px)] xl:overflow-y-auto xl:pr-1">
          {queue.length === 0 && (
            <div className="card flex flex-col items-center px-4 py-10 text-center">
              <Inbox size={22} className="text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No ideas match these filters.</p>
            </div>
          )}
          {queue.map((idea) => (
            <button
              key={idea.id}
              onClick={() => selectIdea(idea.id)}
              className={`card block w-full p-4 text-left transition-all ${
                selected?.id === idea.id ? 'ring-2 ring-primary' : 'hover:shadow-lifted'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-slate-400">{idea.id}</span>
                <span className="text-xs text-slate-400">{formatDate(idea.createdAt)}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm font-medium text-slate-800">{idea.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {userName(idea.submittedBy)} · {idea.department}
              </p>
              <p className="mt-2 text-xs font-semibold text-teal-700">
                {formatINRCompact(idea.expectedImpact.expectedAnnualSaving)} expected / yr
              </p>
            </button>
          ))}
        </div>

        {/* Split view: idea detail + validation panel */}
        {selected ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="card space-y-5 p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-400">{selected.id}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {selected.costInnovationType}
                  </span>
                </div>
                <h2 className="mt-1.5 text-lg font-semibold text-slate-900">{selected.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {userName(selected.submittedBy)} · {selected.department} · {formatDate(selected.createdAt)}
                </p>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{selected.description}</p>
              {selected.photo && (
                <div className="max-w-xs">
                  <PhotoWithLightbox src={selected.photo} alt={selected.title} />
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Part codes</h3>
                <div className="mt-2 space-y-3">
                  {selected.partCodes.map((code) => {
                    const part = getPartCode(code);
                    return part ? <PartCodeCard key={code} part={part} /> : null;
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Expected impact</h3>
                <div className="mt-2">
                  <ImpactGrid impact={selected.expectedImpact} />
                </div>
              </div>
            </div>

            <div className="card h-fit p-5">
              <h3 className="text-sm font-semibold text-slate-900">Feasibility check</h3>
              <div className="mt-3 space-y-2.5">
                {CHECKLIST_ITEMS.map(({ key, label, hint }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[key]}
                      onChange={(e) => setChecklist((c) => ({ ...c, [key]: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary accent-teal-700"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-700">{label}</span>
                      <span className="block text-xs text-slate-400">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="label">
                  Remarks {remarksError ? <span className="text-red-600">*</span> : <span className="text-slate-400">(mandatory when rejecting)</span>}
                </label>
                <textarea
                  className={`input min-h-[90px] resize-y ${remarksError ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Assessment notes, conditions, required validations…"
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (e.target.value.trim()) setRemarksError('');
                  }}
                />
                {remarksError && <p className="mt-1.5 text-sm text-red-600">{remarksError}</p>}
              </div>
              <div className="mt-4 space-y-2">
                <button className="btn-primary w-full" onClick={handleValidate}>
                  <CheckCircle2 size={16} /> Validate — Feasible
                </button>
                <button className="btn-danger w-full" onClick={handleRejectClick}>
                  <XCircle size={16} /> Not Feasible
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex items-center justify-center p-10 text-sm text-slate-400">
            Select an idea from the queue to review it.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmReject}
        title="Mark idea as Not Feasible?"
        message={
          <>
            <span className="font-mono font-semibold">{selected?.id}</span> will be rejected and the submitter will see
            your remarks. This is a terminal state — the idea cannot re-enter the workflow.
          </>
        }
        confirmLabel="Reject idea"
        danger
        onConfirm={handleRejectConfirm}
        onCancel={() => setConfirmReject(false)}
      />
    </div>
  );
}
