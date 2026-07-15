export type Role = 'submitter' | 'validator';

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
  department: Department;
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
  'Raw Material Change',
  'Power/Energy Optimization',
  'Process Improvement',
  'Supplier/Sourcing Change',
  'Design Optimization',
  'Packaging & Logistics',
  'Scrap/Wastage Reduction',
] as const;
export type CostInnovationType = (typeof COST_INNOVATION_TYPES)[number];

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
  department: Department;
  partCodes: string[]; // PartCode.code values
  description: string;
  photo?: string; // data URL / object URL
  costInnovationType: CostInnovationType;
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
