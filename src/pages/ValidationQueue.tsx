import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react';
import { COST_INNOVATION_TYPES, DEPARTMENTS, type CostInnovationType, type Department, type Validation } from '../types';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { useToastStore } from '../store/toast';
import { userName } from '../data/users';
import { PhotoWithLightbox } from '../components/Lightbox';
import { EmptyState } from '../components/EmptyState';
import { CenterModal } from '../components/CenterModal';
import { formatDate, formatINRCompact, formatPercent } from '../utils/format';

const CHECKLIST_ITEMS: { key: keyof Validation['checklist']; label: string }[] = [
  { key: 'technicalFeasibility', label: 'Technical feasibility' },
  { key: 'costCredibility', label: 'Cost credibility' },
  { key: 'implementationComplexity', label: 'Implementation complexity acceptable' },
  { key: 'riskAcceptable', label: 'Risk acceptable' },
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

  const pendingTotal = useMemo(() => ideas.filter((i) => i.status === 'Pending Validation').length, [ideas]);

  const queue = useMemo(
    () =>
      ideas
        .filter((i) => i.status === 'Pending Validation')
        .filter(
          (i) =>
            (deptFilter === 'All' || i.department === deptFilter) &&
            (typeFilter === 'All' || i.costInnovationType === typeFilter)
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [ideas, deptFilter, typeFilter]
  );

  const selected = ideas.find((i) => i.id === selectedId) ?? null;

  function openReview(id: string) {
    setSelectedId(id);
    setChecklist(DEFAULT_CHECKLIST);
    setRemarks('');
    setRemarksError('');
    setConfirmReject(false);
  }

  function closeDrawer() {
    setSelectedId(null);
    setConfirmReject(false);
  }

  function handleValidate() {
    if (!selected) return;
    validateIdea(selected.id, user.id, checklist, remarks.trim() || 'Validated as feasible.');
    toast(`${selected.id} marked Feasible — ready for task assignment`);
    closeDrawer();
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
    closeDrawer();
  }

  if (pendingTotal === 0) {
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
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Validation Queue</h2>
        <p className={`mt-1 text-sm ${queue.length > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
          {queue.length} idea{queue.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      {/* Filters */}
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
      </div>

      {/* Card list */}
      {queue.length === 0 ? (
        <div className="card px-4 py-10 text-center text-sm text-slate-500">No ideas match these filters.</div>
      ) : (
        <div className="space-y-2.5">
          {queue.map((idea) => (
            <div key={idea.id} className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">
                  <span className="font-mono">{idea.id}</span> · {idea.department ?? idea.organization ?? 'External Vendor'} ·
                  Submitted {formatDate(idea.createdAt)}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{idea.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {userName(idea.submittedBy)} · Expected saving:{' '}
                  <span className="font-semibold text-teal-700">{formatINRCompact(idea.expectedImpact.expectedAnnualSaving)}/yr</span>
                </p>
              </div>
              <button className="btn-secondary shrink-0 !px-3 !py-1.5 text-sm" onClick={() => openReview(idea.id)}>
                Review →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      <CenterModal
        open={!!selected}
        onClose={closeDrawer}
        title={
          selected && (
            <div className="min-w-0">
              <p className="font-mono text-xs text-slate-400">{selected.id}</p>
              <h3 className="truncate text-base font-semibold text-slate-900">{selected.title}</h3>
            </div>
          )
        }
        footer={
          selected &&
          (confirmReject ? (
            <div>
              <p className="text-sm font-medium text-slate-700">Reject this idea? This cannot be undone.</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary w-1/2" onClick={() => setConfirmReject(false)}>
                  Cancel
                </button>
                <button className="btn-danger w-1/2" onClick={handleRejectConfirm}>
                  Yes, reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button className="btn-danger w-1/2" onClick={handleRejectClick}>
                <XCircle size={16} /> Mark Not Feasible
              </button>
              <button className="btn-primary w-1/2" onClick={handleValidate}>
                <CheckCircle2 size={16} /> Mark Feasible ✓
              </button>
            </div>
          ))
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Idea header */}
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{userName(selected.submittedBy)}</span>
                <span>·</span>
                <span>{selected.department ?? selected.organization ?? 'External Vendor'}</span>
                <span>·</span>
                <span>{formatDate(selected.createdAt)}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {selected.costInnovationType}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{selected.description}</p>
            </div>

            {/* Part code chips */}
            <div className="flex flex-wrap gap-1.5">
              {selected.partCodes.map((code) => (
                <span key={code} className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-600">
                  {code}
                </span>
              ))}
            </div>

            {/* Expected impact — two key numbers */}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Expected saving</p>
              <p className="text-xl font-semibold text-teal-700">
                {formatINRCompact(selected.expectedImpact.expectedAnnualSaving)}/yr
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Saving %: {formatPercent(selected.expectedImpact.expectedSavingPercent)}
              </p>
            </div>

            {/* Photo */}
            {selected.photo && (
              <div className="max-w-[200px] [&_img]:h-[120px] [&_img]:w-auto [&_img]:object-cover">
                <PhotoWithLightbox src={selected.photo} alt={selected.title} />
              </div>
            )}

            {/* Feasibility checklist */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Feasibility check</h4>
              <div className="mt-2 space-y-1.5">
                {CHECKLIST_ITEMS.map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={checklist[key]}
                      onChange={(e) => setChecklist((c) => ({ ...c, [key]: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-primary accent-teal-700"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="label">Remarks</label>
              <textarea
                className={`input min-h-[80px] resize-y ${remarksError ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Add notes for the submitter..."
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  if (e.target.value.trim()) setRemarksError('');
                }}
              />
              {remarksError && <p className="mt-1.5 text-sm text-red-600">{remarksError}</p>}
            </div>
          </div>
        )}
      </CenterModal>
    </div>
  );
}
