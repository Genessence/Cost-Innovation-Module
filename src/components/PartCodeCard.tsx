import { Package } from 'lucide-react';
import type { PartCode } from '../types';
import { formatINR } from '../utils/format';

export function PartCodeCard({ part, compact }: { part: PartCode; compact?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light">
            <Package size={17} className="text-primary-dark" />
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-slate-800">{part.code}</p>
            <p className="text-sm text-slate-600">{part.description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
          {part.category}
        </span>
      </div>
      {!compact && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div className="col-span-2">
            <dt className="text-xs text-slate-400">Specification</dt>
            <dd className="text-slate-700">{part.specification}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-slate-400">Material</dt>
            <dd className="text-slate-700">{part.material}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Current unit cost</dt>
            <dd className="font-semibold text-slate-800">{formatINR(part.currentUnitCost, part.currentUnitCost < 10 ? 2 : 0)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Quarterly volume</dt>
            <dd className="font-semibold text-slate-800">{part.quarterlyVolume.toLocaleString('en-IN')} units</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
