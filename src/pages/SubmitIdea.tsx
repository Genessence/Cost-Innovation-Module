import { useMemo, useRef, useState, type DragEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ImagePlus, Search, Trash2, X } from 'lucide-react';
import { COST_INNOVATION_TYPES, type CostInnovationType } from '../types';
import { PART_CODES, getPartCode } from '../data/partCodes';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { useToastStore } from '../store/toast';
import { PartCodeCard } from '../components/PartCodeCard';
import { formatINR, formatINRCompact, formatPercent } from '../utils/format';

const TYPE_HINTS: Record<CostInnovationType, string> = {
  'Raw Material Change': 'Alternate material or grade at lower cost',
  'Power/Energy Optimization': 'Cut energy consumed per unit produced',
  'Process Improvement': 'Better yield, cycle time, or routing',
  'Supplier/Sourcing Change': 'New vendor, negotiation, or localization',
  'Design Optimization': 'Part redesign, standardization, or delayering',
  'Packaging & Logistics': 'Cheaper packaging or freight per unit',
  'Scrap/Wastage Reduction': 'Recover or reduce material waste',
};

export function SubmitIdea() {
  const user = useAuthStore((s) => s.currentUser)!;
  const submitIdea = useAppStore((s) => s.submitIdea);
  const toast = useToastStore((s) => s.toast);
  const navigate = useNavigate();

  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [type, setType] = useState<CostInnovationType | ''>('');
  const [expectedCostInput, setExpectedCostInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedParts = selectedCodes.map((c) => getPartCode(c)!);
  const currentCost = selectedParts.reduce((s, p) => s + p.currentUnitCost, 0);
  const minVolume = selectedParts.length ? Math.min(...selectedParts.map((p) => p.quarterlyVolume)) : 0;
  const expectedCost = parseFloat(expectedCostInput);
  const hasValidCost = !Number.isNaN(expectedCost) && expectedCost >= 0;
  const delta = hasValidCost ? currentCost - expectedCost : 0;
  const savingPercent = hasValidCost && currentCost > 0 ? (delta / currentCost) * 100 : 0;
  const annualSaving = hasValidCost ? delta * minVolume * 4 : 0;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PART_CODES.filter(
      (p) =>
        !selectedCodes.includes(p.code) &&
        (q === '' ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query, selectedCodes]);

  function addPart(code: string) {
    setSelectedCodes((c) => [...c, code]);
    setQuery('');
    setDropdownOpen(false);
    setErrors((e) => ({ ...e, partCodes: '' }));
  }

  function readFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  function handleSubmit() {
    const errs: Record<string, string> = {};
    if (selectedCodes.length === 0) errs.partCodes = 'Select at least one part code.';
    if (!title.trim()) errs.title = 'Title is required.';
    if (description.trim().length < 20) errs.description = 'Describe the idea in at least 20 characters.';
    if (!type) errs.type = 'Choose the type of cost innovation.';
    if (!hasValidCost) errs.expectedCost = 'Enter the expected new cost per unit.';
    else if (expectedCost >= currentCost) errs.expectedCost = 'Expected cost must be lower than the current cost.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const id = submitIdea({
      title: title.trim(),
      submittedBy: user.id,
      department: user.department,
      partCodes: selectedCodes,
      description: description.trim(),
      photo,
      costInnovationType: type as CostInnovationType,
      expectedCost,
    });
    setSubmittedId(id);
    toast(`Idea ${id} submitted for validation`);
  }

  if (submittedId) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card flex flex-col items-center px-8 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900">Idea submitted!</h2>
          <p className="mt-2 text-sm text-slate-500">
            <span className="font-mono font-semibold text-slate-700">{submittedId}</span> is now pending validation with
            the {user.department} validator. You can track its status from My Ideas.
          </p>
          <div className="mt-7 flex gap-3">
            <button className="btn-primary" onClick={() => navigate(`/ideas/${submittedId}`)}>
              View idea
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setSubmittedId(null);
                setSelectedCodes([]);
                setTitle('');
                setDescription('');
                setPhoto(undefined);
                setType('');
                setExpectedCostInput('');
              }}
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Section 1: Part codes */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-slate-900">1 · Part code(s)</h2>
        <p className="mt-0.5 text-sm text-slate-500">Search the ERP part master and link one or more part codes.</p>
        <div className="relative mt-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by code, description, or category — e.g. “compressor” or “AMB-PCB”"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          />
          {dropdownOpen && matches.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lifted">
              {matches.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addPart(p.code)}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-50 px-3.5 py-2.5 text-left hover:bg-teal-50/60"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-slate-800">{p.code}</p>
                    <p className="text-xs text-slate-500">{p.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatINR(p.currentUnitCost, p.currentUnitCost < 10 ? 2 : 0)} / unit</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedCodes.map((code) => (
              <span key={code} className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 font-mono text-xs font-medium text-primary-dark">
                {code}
                <button onClick={() => setSelectedCodes((c) => c.filter((x) => x !== code))} aria-label={`Remove ${code}`}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.partCodes && <p className="mt-2 text-sm text-red-600">{errors.partCodes}</p>}
        {selectedParts.length > 0 && (
          <div className="mt-4 space-y-3">
            {selectedParts.map((p) => (
              <PartCodeCard key={p.code} part={p} />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Idea details */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-slate-900">2 · Idea details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="e.g. Alternate vendor for indoor display PCB"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <p className="mt-1.5 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="What is the idea, why will it save cost, and what evidence do you have (trials, quotes, benchmarks)?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
          </div>
          <div>
            <label className="label">Photo (optional)</label>
            {photo ? (
              <div className="relative inline-block">
                <img src={photo} alt="Idea attachment" className="h-40 rounded-lg border border-slate-200 object-cover" />
                <button
                  className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 text-slate-500 shadow-card ring-1 ring-slate-200 hover:text-red-600"
                  onClick={() => setPhoto(undefined)}
                  aria-label="Remove photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  dragging ? 'border-primary bg-teal-50/60' : 'border-slate-300 hover:border-primary/60 hover:bg-slate-50'
                }`}
              >
                <ImagePlus size={24} className="text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">Drag & drop an image here, or click to browse</p>
                <p className="text-xs text-slate-400">Sample photo, trial part, quote snapshot…</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) readFile(f);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Innovation type */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-slate-900">3 · Type of cost innovation *</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {COST_INNOVATION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setErrors((e) => ({ ...e, type: '' }));
              }}
              className={`rounded-lg border p-3.5 text-left transition-colors ${
                type === t ? 'border-primary bg-teal-50/70 ring-1 ring-primary' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm font-medium text-slate-800">{t}</p>
              <p className="mt-0.5 text-xs text-slate-500">{TYPE_HINTS[t]}</p>
            </button>
          ))}
        </div>
        {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type}</p>}
      </section>

      {/* Section 4: Expected impact */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-slate-900">4 · Expected impact</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Current cost auto-fills from the selected part code(s). Savings update live as you type.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current cost / unit (auto)</label>
            <input className="input bg-slate-50 text-slate-500" value={selectedParts.length ? formatINR(currentCost, currentCost < 10 ? 2 : 0) : '—'} readOnly />
          </div>
          <div>
            <label className="label">Expected new cost / unit (₹) *</label>
            <input
              className="input"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 385"
              value={expectedCostInput}
              onChange={(e) => setExpectedCostInput(e.target.value)}
            />
            {errors.expectedCost && <p className="mt-1.5 text-sm text-red-600">{errors.expectedCost}</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-teal-50 p-4">
            <p className="text-xs text-teal-700">Expected saving</p>
            <p className="mt-1 text-xl font-semibold text-teal-800">
              {hasValidCost && selectedParts.length ? formatPercent(savingPercent) : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-teal-50 p-4">
            <p className="text-xs text-teal-700">Expected annual saving</p>
            <p className="mt-1 text-xl font-semibold text-teal-800">
              {hasValidCost && selectedParts.length ? formatINRCompact(annualSaving) : '—'}
            </p>
            {selectedParts.length > 0 && (
              <p className="mt-0.5 text-[11px] text-teal-700/70">
                Δ {hasValidCost ? formatINR(Math.max(delta, 0), delta < 10 ? 2 : 0) : '—'} × {minVolume.toLocaleString('en-IN')} units/qtr × 4
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pb-4">
        <Link to="/my-ideas" className="text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </Link>
        <button className="btn-primary px-6" onClick={handleSubmit}>
          Submit idea for validation
        </button>
      </div>
    </div>
  );
}
