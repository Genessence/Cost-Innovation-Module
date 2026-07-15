import { COST_INNOVATION_TYPES, DEPARTMENTS, type CostInnovationType, type Department } from '../types';

/**
 * Categorical palette validated for CVD separation and lightness on white cards
 * (teal-led, fixed slot order — never cycled or re-ranked).
 */
export const CATEGORICAL = ['#0d9488', '#eda100', '#4a3aa7', '#e34948', '#2a78d6', '#eb6834', '#e87ba4'];

/** Fixed department → color mapping, consistent across every chart. */
export const DEPT_COLORS: Record<Department, string> = Object.fromEntries(
  DEPARTMENTS.map((d, i) => [d, CATEGORICAL[i]])
) as Record<Department, string>;

/** Fixed innovation-type → color mapping. */
export const TYPE_COLORS: Record<CostInnovationType, string> = Object.fromEntries(
  COST_INNOVATION_TYPES.map((t, i) => [t, CATEGORICAL[i]])
) as Record<CostInnovationType, string>;

/** Status series for the approval-rate chart (semantic, matches app badges). */
export const APPROVAL_COLORS = {
  approved: '#0F766E',
  rejected: '#DC2626',
  pending: '#D97706',
};

export const CHART_GRID = '#E9E8E2';
export const CHART_AXIS = '#94A3B8';
