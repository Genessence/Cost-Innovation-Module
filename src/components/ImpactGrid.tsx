import { TrendingDown } from 'lucide-react';
import type { ExpectedImpact } from '../types';
import { formatINR, formatINRCompact, formatPercent } from '../utils/format';

/** Expected-impact breakdown shown on idea detail and validation views. */
export function ImpactGrid({ impact }: { impact: ExpectedImpact }) {
  const decimals = impact.currentCost < 10 ? 2 : 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Current cost / unit</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">{formatINR(impact.currentCost, decimals)}</p>
      </div>
      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Expected cost / unit</p>
        <p className="mt-1 text-lg font-semibold text-slate-800">{formatINR(impact.expectedCost, decimals)}</p>
      </div>
      <div className="rounded-lg bg-teal-50 p-3">
        <p className="text-xs text-teal-700">Expected saving</p>
        <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-teal-800">
          <TrendingDown size={16} />
          {formatPercent(impact.expectedSavingPercent)}
        </p>
      </div>
      <div className="rounded-lg bg-teal-50 p-3">
        <p className="text-xs text-teal-700">Expected annual saving</p>
        <p className="mt-1 text-lg font-semibold text-teal-800">{formatINRCompact(impact.expectedAnnualSaving)}</p>
      </div>
    </div>
  );
}
