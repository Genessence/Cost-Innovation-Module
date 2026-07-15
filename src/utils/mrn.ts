import type { Idea, MRNRecord } from '../types';
import { MRN_RECORDS, QUARTERS } from '../data/mrnRecords';

export interface MrnPartRow {
  partCode: string;
  baselineCost: number;
  postCost: number;
  volume: number;
  annualSaving: number;
}

export interface MrnComparison {
  baselineQuarter: string;
  postQuarter: string;
  rows: MrnPartRow[];
  baselineUnitCost: number; // summed across linked parts
  actualUnitCost: number;
  actualAnnualSaving: number;
  variancePercent: number; // actual vs expected annual saving
}

/** Index of the calendar quarter containing the date, clamped to available MRN quarters. */
export function quarterIndexOf(iso: string): number {
  const d = new Date(iso);
  const key = `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  const idx = QUARTERS.indexOf(key);
  if (idx >= 0) return idx;
  // Before the first quarter → 0; after the last → last.
  return d.getTime() < new Date('2026-01-01').getTime() ? 0 : QUARTERS.length - 1;
}

function record(quarter: string, partCode: string): MRNRecord | undefined {
  return MRN_RECORDS.find((r) => r.quarter === quarter && r.partCode === partCode);
}

/**
 * Compare an implemented idea's part codes against the quarterly MRN table:
 * baseline = quarter before the execution-completion quarter, post = latest
 * quarter reported. Returns null if execution is not complete.
 */
export function computeMrnComparison(idea: Idea): MrnComparison | null {
  const completedAt = idea.executionTask?.completedAt;
  if (!completedAt) return null;

  const baselineIdx = Math.max(0, quarterIndexOf(completedAt) - 1);
  const baselineQuarter = QUARTERS[baselineIdx];
  const postQuarter = QUARTERS[QUARTERS.length - 1];

  const rows: MrnPartRow[] = idea.partCodes.map((code) => {
    const base = record(baselineQuarter, code);
    const post = record(postQuarter, code);
    const baselineCost = base?.actualUnitCost ?? 0;
    const postCost = post?.actualUnitCost ?? baselineCost;
    const volume = post?.volume ?? 0;
    return {
      partCode: code,
      baselineCost,
      postCost,
      volume,
      annualSaving: (baselineCost - postCost) * volume * 4,
    };
  });

  const baselineUnitCost = rows.reduce((s, r) => s + r.baselineCost, 0);
  const actualUnitCost = rows.reduce((s, r) => s + r.postCost, 0);
  const actualAnnualSaving = rows.reduce((s, r) => s + r.annualSaving, 0);
  const expected = idea.expectedImpact.expectedAnnualSaving;
  const variancePercent = expected > 0 ? ((actualAnnualSaving - expected) / expected) * 100 : 0;

  return {
    baselineQuarter,
    postQuarter,
    rows,
    baselineUnitCost,
    actualUnitCost,
    actualAnnualSaving,
    variancePercent,
  };
}
