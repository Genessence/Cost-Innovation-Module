export type Role = 'submitter' | 'validator';

export type SubmitterType = 'employee' | 'vendor';

export const DEPARTMENTS = [
  'Research & Development',
  'Sourcing',
  'Purchase',
  'Quality',
  'Process',
  'Supplier',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  submitterType?: SubmitterType; // only present when role === 'submitter'
  department?: Department; // present for employee submitters & validators
  organization?: string; // present for vendor submitters (their company name)
  designation: string;
}

export type PartCategory =
  | 'Compressor'
  | 'Sheet Metal'
  | 'Copper Tubing'
  | 'PCB'
  | 'Motor'
  | 'Fasteners'
  | 'Insulation'
  | 'Wiring Harness'
  | 'Plastics'
  | 'Heat Exchanger';

export interface PartCode {
  code: string;
  description: string;
  specification: string;
  material: string;
  currentUnitCost: number; // ₹ per unit
  quarterlyVolume: number; // units per quarter
  category: PartCategory;
}

export const COST_INNOVATION_TYPES = [
  'Negotiations',
  'Value Engineering',
  'Cost Engineering',
  'Alternate Material / Suppliers',
  'Payment Terms',
  'Packing Standard Implementation',
  'Alternate Supplier',
  'Freight Operations',
  'Strategic Masking',
  'Localization',
  'Scrap Management',
  'Process Optimization',
  'Forex Determination',
  'Dimensional Correction',
  'Tolerance Update',
  'Volume Control',
  'Digitalization and Optimization',
] as const;
export type CostInnovationType = (typeof COST_INNOVATION_TYPES)[number];

export const COMMODITIES = [
  'Aluminium',
  'Copper',
  'Steel (CRCA / GI)',
  'Polypropylene (PP)',
  'ABS Plastic',
  'NBR / EPDM Rubber',
  'EPS / PE Foam',
  'PCB / Electronics',
  'Wiring & Harness',
  'Fasteners',
  'Packaging Material',
  'Refrigerant (R32 / R410A)',
  'Logistics / Freight',
  'Energy / Utilities',
  'Others',
] as const;
export type Commodity = (typeof COMMODITIES)[number];

export const IDEA_STATUSES = [
  'Pending Validation',
  'Feasible',
  'Not Feasible',
  'In Execution',
  'Implemented',
  'Verified',
] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export interface ExpectedImpact {
  currentCost: number; // combined current cost per unit across linked parts (₹)
  expectedCost: number; // expected new combined cost per unit (₹)
  expectedSavingPercent: number;
  expectedAnnualSaving: number; // ₹ per year
}

export interface TimelineEvent {
  event: string;
  actor: string; // user name
  timestamp: string; // ISO
  note?: string;
}

export type TaskStatus = 'Assigned' | 'In Progress' | 'Completed';
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface ExecutionTask {
  assignedTo: string; // user id
  assignedBy: string; // user id
  targetDate: string; // ISO date
  priority: TaskPriority;
  instructions: string;
  status: TaskStatus;
  assignedAt: string; // ISO
  completedAt?: string; // ISO
}

export interface MRNVerification {
  verifiedBy: string; // user id
  verifiedAt: string; // ISO
  baselineQuarter: string;
  postQuarter: string;
  baselineUnitCost: number; // combined across linked parts
  actualUnitCost: number;
  actualAnnualSaving: number; // ₹ per year
  variancePercent: number; // actual vs expected saving
}

export interface Validation {
  validatedBy: string; // user id
  validatedAt: string; // ISO
  remarks: string;
  checklist: {
    technicalFeasibility: boolean;
    costCredibility: boolean;
    implementationComplexity: boolean;
    riskAcceptable: boolean;
  };
}

export interface Idea {
  id: string; // e.g. CI-2026-0041
  title: string;
  submittedBy: string; // user id
  department?: Department; // undefined for vendor-submitted ideas
  organization?: string; // present for vendor-submitted ideas
  submitterType?: SubmitterType; // 'employee' | 'vendor'
  partCodes: string[]; // PartCode.code values
  description: string;
  photo?: string; // data URL / object URL
  costInnovationType: CostInnovationType;
  commodity?: Commodity;
  expectedImpact: ExpectedImpact;
  status: IdeaStatus;
  remarks?: string; // latest validator remarks
  validation?: Validation;
  executionTask?: ExecutionTask;
  mrnVerification?: MRNVerification;
  createdAt: string; // ISO
  timeline: TimelineEvent[];
}

export interface MRNRecord {
  quarter: string; // e.g. "Q1 2026"
  partCode: string;
  volume: number;
  actualUnitCost: number; // ₹
}

export interface Notification {
  id: string;
  userId: string; // recipient
  message: string;
  ideaId: string;
  createdAt: string;
  read: boolean;
}
