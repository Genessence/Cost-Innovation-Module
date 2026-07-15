import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CostInnovationType,
  Department,
  Idea,
  Notification,
  TaskPriority,
  Validation,
} from '../types';
import { SEED_IDEAS, buildImpact, validatorForDepartment } from '../data/ideas';
import { userName } from '../data/users';
import { computeMrnComparison } from '../utils/mrn';

export interface SubmitIdeaInput {
  title: string;
  submittedBy: string;
  department: Department;
  partCodes: string[];
  description: string;
  photo?: string;
  costInnovationType: CostInnovationType;
  expectedCost: number;
}

export interface AssignTaskInput {
  assignedTo: string;
  targetDate: string;
  priority: TaskPriority;
  instructions: string;
}

interface AppState {
  ideas: Idea[];
  notifications: Notification[];
  submitIdea: (input: SubmitIdeaInput) => string;
  validateIdea: (ideaId: string, validatorId: string, checklist: Validation['checklist'], remarks: string) => void;
  rejectIdea: (ideaId: string, validatorId: string, checklist: Validation['checklist'], remarks: string) => void;
  assignTask: (ideaId: string, validatorId: string, task: AssignTaskInput) => void;
  advanceTask: (ideaId: string, actorId: string) => void;
  verifyIdea: (ideaId: string, validatorId: string) => void;
  markNotificationsRead: (userId: string) => void;
  resetDemoData: () => void;
}

let notifSeq = 0;
function notif(userId: string, message: string, ideaId: string): Notification {
  notifSeq += 1;
  return {
    id: `n-${Date.now()}-${notifSeq}`,
    userId,
    message,
    ideaId,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

function nextIdeaId(ideas: Idea[]): string {
  const year = new Date().getFullYear();
  const max = ideas
    .filter((i) => i.id.startsWith(`CI-${year}-`))
    .reduce((m, i) => Math.max(m, parseInt(i.id.slice(-4), 10) || 0), 0);
  return `CI-${year}-${String(max + 1).padStart(4, '0')}`;
}

function updateIdea(ideas: Idea[], ideaId: string, fn: (idea: Idea) => Idea): Idea[] {
  return ideas.map((i) => (i.id === ideaId ? fn(i) : i));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ideas: SEED_IDEAS,
      notifications: [],

      submitIdea: (input) => {
        const now = new Date().toISOString();
        const id = nextIdeaId(get().ideas);
        const idea: Idea = {
          id,
          title: input.title,
          submittedBy: input.submittedBy,
          department: input.department,
          partCodes: input.partCodes,
          description: input.description,
          photo: input.photo,
          costInnovationType: input.costInnovationType,
          expectedImpact: buildImpact(input.partCodes, input.expectedCost),
          status: 'Pending Validation',
          createdAt: now,
          timeline: [{ event: 'Idea submitted', actor: userName(input.submittedBy), timestamp: now }],
        };
        const validator = validatorForDepartment(input.department);
        set((s) => ({
          ideas: [idea, ...s.ideas],
          notifications: [
            notif(validator, `New idea ${id} submitted by ${userName(input.submittedBy)} awaits validation`, id),
            ...s.notifications,
          ],
        }));
        return id;
      },

      validateIdea: (ideaId, validatorId, checklist, remarks) => {
        const now = new Date().toISOString();
        set((s) => {
          const idea = s.ideas.find((i) => i.id === ideaId);
          if (!idea || idea.status !== 'Pending Validation') return s;
          return {
            ideas: updateIdea(s.ideas, ideaId, (i) => ({
              ...i,
              status: 'Feasible',
              remarks,
              validation: { validatedBy: validatorId, validatedAt: now, remarks, checklist },
              timeline: [...i.timeline, { event: 'Marked Feasible', actor: userName(validatorId), timestamp: now, note: remarks || undefined }],
            })),
            notifications: [
              notif(idea.submittedBy, `Your idea ${ideaId} was marked Feasible by ${userName(validatorId)}`, ideaId),
              ...s.notifications,
            ],
          };
        });
      },

      rejectIdea: (ideaId, validatorId, checklist, remarks) => {
        const now = new Date().toISOString();
        set((s) => {
          const idea = s.ideas.find((i) => i.id === ideaId);
          if (!idea || idea.status !== 'Pending Validation') return s;
          return {
            ideas: updateIdea(s.ideas, ideaId, (i) => ({
              ...i,
              status: 'Not Feasible',
              remarks,
              validation: { validatedBy: validatorId, validatedAt: now, remarks, checklist },
              timeline: [...i.timeline, { event: 'Marked Not Feasible', actor: userName(validatorId), timestamp: now, note: remarks }],
            })),
            notifications: [
              notif(idea.submittedBy, `Your idea ${ideaId} was marked Not Feasible — see validator remarks`, ideaId),
              ...s.notifications,
            ],
          };
        });
      },

      assignTask: (ideaId, validatorId, task) => {
        const now = new Date().toISOString();
        set((s) => {
          const idea = s.ideas.find((i) => i.id === ideaId);
          if (!idea || idea.status !== 'Feasible') return s;
          return {
            ideas: updateIdea(s.ideas, ideaId, (i) => ({
              ...i,
              status: 'In Execution',
              executionTask: {
                assignedTo: task.assignedTo,
                assignedBy: validatorId,
                targetDate: task.targetDate,
                priority: task.priority,
                instructions: task.instructions,
                status: 'Assigned',
                assignedAt: now,
              },
              timeline: [
                ...i.timeline,
                {
                  event: 'Execution task assigned',
                  actor: userName(validatorId),
                  timestamp: now,
                  note: `Assigned to ${userName(task.assignedTo)} · ${task.priority} priority · target ${task.targetDate}`,
                },
              ],
            })),
            notifications: [
              notif(task.assignedTo, `Execution task on ${ideaId} assigned to you by ${userName(validatorId)}`, ideaId),
              notif(idea.submittedBy, `Your idea ${ideaId} moved to execution`, ideaId),
              ...s.notifications,
            ],
          };
        });
      },

      advanceTask: (ideaId, actorId) => {
        const now = new Date().toISOString();
        set((s) => {
          const idea = s.ideas.find((i) => i.id === ideaId);
          const task = idea?.executionTask;
          if (!idea || !task || task.status === 'Completed') return s;
          const completing = task.status === 'In Progress';
          const newNotifs: Notification[] = completing
            ? [notif(idea.submittedBy, `Your idea ${ideaId} has been implemented`, ideaId)]
            : [];
          return {
            ideas: updateIdea(s.ideas, ideaId, (i) => ({
              ...i,
              status: completing ? 'Implemented' : i.status,
              executionTask: {
                ...task,
                status: completing ? 'Completed' : 'In Progress',
                completedAt: completing ? now : undefined,
              },
              timeline: [
                ...i.timeline,
                completing
                  ? { event: 'Execution completed — idea implemented', actor: userName(actorId), timestamp: now }
                  : { event: 'Execution started', actor: userName(actorId), timestamp: now },
              ],
            })),
            notifications: [...newNotifs, ...s.notifications],
          };
        });
      },

      verifyIdea: (ideaId, validatorId) => {
        const now = new Date().toISOString();
        set((s) => {
          const idea = s.ideas.find((i) => i.id === ideaId);
          if (!idea || idea.status !== 'Implemented') return s;
          const cmp = computeMrnComparison(idea);
          if (!cmp) return s;
          return {
            ideas: updateIdea(s.ideas, ideaId, (i) => ({
              ...i,
              status: 'Verified',
              mrnVerification: {
                verifiedBy: validatorId,
                verifiedAt: now,
                baselineQuarter: cmp.baselineQuarter,
                postQuarter: cmp.postQuarter,
                baselineUnitCost: cmp.baselineUnitCost,
                actualUnitCost: cmp.actualUnitCost,
                actualAnnualSaving: cmp.actualAnnualSaving,
                variancePercent: cmp.variancePercent,
              },
              timeline: [
                ...i.timeline,
                {
                  event: 'Savings verified against MRN',
                  actor: userName(validatorId),
                  timestamp: now,
                  note: `${cmp.baselineQuarter} vs ${cmp.postQuarter} · realized annual saving confirmed`,
                },
              ],
            })),
            notifications: [
              notif(idea.submittedBy, `Savings on your idea ${ideaId} verified against MRN`, ideaId),
              ...s.notifications,
            ],
          };
        });
      },

      markNotificationsRead: (userId) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
        }));
      },

      resetDemoData: () => set({ ideas: SEED_IDEAS, notifications: [] }),
    }),
    { name: 'cih-app', version: 1 }
  )
);
