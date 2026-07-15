import type { MRNRecord } from '../types';
import { PART_CODES } from './partCodes';

/** Quarterly MRN reporting periods available in the mock ERP, oldest first. */
export const QUARTERS = ['Q4 2025', 'Q1 2026', 'Q2 2026'];

/**
 * Unit-cost reductions that landed in the MRN reports as ideas got implemented.
 * `effectiveIdx` is the QUARTERS index from which the new cost applies.
 * Kept in sync with the implemented/verified seed ideas in ideas.ts.
 */
const COST_REDUCTIONS: Record<string, { effectiveIdx: number; newUnitCost: number }> = {
  'AMB-SHM-01102': { effectiveIdx: 1, newUnitCost: 452 }, // CI-2025-0003, implemented Jan 2026
  'AMB-PCB-03315': { effectiveIdx: 1, newUnitCost: 388 }, // CI-2025-0007, implemented Feb 2026
  'AMB-CTB-02201': { effectiveIdx: 1, newUnitCost: 1172 }, // CI-2025-0011, implemented Mar 2026
  'AMB-INS-06612': { effectiveIdx: 1, newUnitCost: 103 }, // CI-2025-0014, implemented Feb 2026
  'AMB-SHM-01118': { effectiveIdx: 2, newUnitCost: 296 }, // CI-2026-0002 + CI-2026-0018, Q2 2026
  'AMB-FST-05501': { effectiveIdx: 2, newUnitCost: 0.79 }, // CI-2026-0005, implemented Apr 2026
  'AMB-PLS-08812': { effectiveIdx: 2, newUnitCost: 81 }, // CI-2026-0008, implemented May 2026
  'AMB-WRH-07722': { effectiveIdx: 2, newUnitCost: 53 }, // CI-2026-0012, implemented May 2026
  'AMB-HEX-09901': { effectiveIdx: 2, newUnitCost: 2262 }, // CI-2026-0015, implemented Jun 2026
  'AMB-CTB-02230': { effectiveIdx: 2, newUnitCost: 615 }, // CI-2026-0021, implemented Jun 2026
};

/** One MRN row per part per quarter, generated from the ERP master. */
export const MRN_RECORDS: MRNRecord[] = QUARTERS.flatMap((quarter, qIdx) =>
  PART_CODES.map((part) => {
    const reduction = COST_REDUCTIONS[part.code];
    const actualUnitCost =
      reduction && qIdx >= reduction.effectiveIdx ? reduction.newUnitCost : part.currentUnitCost;
    return { quarter, partCode: part.code, volume: part.quarterlyVolume, actualUnitCost };
  })
);
