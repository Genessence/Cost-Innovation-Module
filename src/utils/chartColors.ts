import { COST_INNOVATION_TYPES, DEPARTMENTS, type CostInnovationType, type Department } from '../types';

/**
 * Categorical palette — muted, warm-compatible hues tuned to sit on cream/peach
 * cards without clashing with the theme. Ordered for CVD separation between
 * adjacent slots (fixed slot order — never cycled or re-ranked).
 */
export const CATEGORICAL = [
  '#C6704A', '#B0782B', '#4E7358', '#5A6E8C', '#7A5E70',
  '#A85A38', '#C9963B', '#6E5C74', '#77997F', '#B24A34',
  '#4A5C78', '#8C5E1E', '#416049', '#8A7D6D',
  '#513C49', '#9E5236', '#334C3A', '#6B5D4D',
];

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
  approved: '#4E7358', // sage
  rejected: '#B24A34', // terracotta-coral
  pending: '#B0782B', // bronze
};

export const CHART_GRID = '#E7DBCB';
export const CHART_AXIS = '#AE9F8E';

/** Shared Recharts tooltip surface — warm card with soft warm shadow. */
export const CHART_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #E7DBCB',
  boxShadow: '0 16px 40px rgba(120,88,56,.16)',
  fontSize: 12.5,
  background: '#FFFDFC',
};

/** Warm hover wash for bar/area cursors. */
export const CHART_CURSOR = 'rgba(198,112,74,0.07)';
