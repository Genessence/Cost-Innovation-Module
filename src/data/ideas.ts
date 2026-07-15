import type {
  CostInnovationType,
  Department,
  ExpectedImpact,
  Idea,
  TaskPriority,
  TimelineEvent,
} from '../types';
import { getPartCode } from './partCodes';
import { userName } from './users';
import { computeMrnComparison } from '../utils/mrn';

const VALIDATOR_BY_DEPT: Record<Department, string> = {
  'Research & Development': 'v-rnd',
  Sourcing: 'v-src',
  Purchase: 'v-pur',
  Quality: 'v-qua',
  Process: 'v-pro',
  Supplier: 'v-sup',
};

export function validatorForDepartment(dept: Department): string {
  return VALIDATOR_BY_DEPT[dept];
}

/**
 * Expected impact from linked parts: current cost is the summed unit cost;
 * annual saving applies the per-set delta to the most constrained part's
 * quarterly volume × 4 quarters.
 */
export function buildImpact(partCodes: string[], expectedCost: number): ExpectedImpact {
  const parts = partCodes.map((c) => getPartCode(c)!);
  const currentCost = parts.reduce((s, p) => s + p.currentUnitCost, 0);
  const volume = Math.min(...parts.map((p) => p.quarterlyVolume));
  const delta = currentCost - expectedCost;
  return {
    currentCost,
    expectedCost,
    expectedSavingPercent: currentCost > 0 ? (delta / currentCost) * 100 : 0,
    expectedAnnualSaving: delta * volume * 4,
  };
}

function ev(event: string, actorId: string, timestamp: string, note?: string): TimelineEvent {
  return { event, actor: userName(actorId), timestamp, ...(note ? { note } : {}) };
}

/** Simple self-contained SVG placeholder image (no network needed). */
function photo(label: string, sub: string, color: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'>` +
    `<rect width='640' height='400' fill='${color}'/>` +
    `<rect x='24' y='24' width='592' height='352' fill='none' stroke='white' stroke-opacity='0.4' stroke-width='2' rx='16'/>` +
    `<text x='320' y='185' font-family='Arial' font-size='30' font-weight='bold' fill='white' text-anchor='middle'>${label}</text>` +
    `<text x='320' y='228' font-family='Arial' font-size='17' fill='white' fill-opacity='0.85' text-anchor='middle'>${sub}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface SeedBase {
  id: string;
  title: string;
  submitter: string;
  department: Department;
  partCodes: string[];
  description: string;
  type: CostInnovationType;
  expectedCost: number;
  createdAt: string;
  photo?: string;
}

function pendingIdea(s: SeedBase): Idea {
  return {
    id: s.id,
    title: s.title,
    submittedBy: s.submitter,
    department: s.department,
    partCodes: s.partCodes,
    description: s.description,
    photo: s.photo,
    costInnovationType: s.type,
    expectedImpact: buildImpact(s.partCodes, s.expectedCost),
    status: 'Pending Validation',
    createdAt: s.createdAt,
    timeline: [ev('Idea submitted', s.submitter, s.createdAt)],
  };
}

const OK_CHECKLIST = {
  technicalFeasibility: true,
  costCredibility: true,
  implementationComplexity: true,
  riskAcceptable: true,
};

function feasibleIdea(s: SeedBase, validatedAt: string, remarks: string): Idea {
  const idea = pendingIdea(s);
  const validator = VALIDATOR_BY_DEPT[s.department];
  idea.status = 'Feasible';
  idea.remarks = remarks;
  idea.validation = { validatedBy: validator, validatedAt, remarks, checklist: OK_CHECKLIST };
  idea.timeline.push(ev('Marked Feasible', validator, validatedAt, remarks));
  return idea;
}

function rejectedIdea(s: SeedBase, validatedAt: string, remarks: string): Idea {
  const idea = pendingIdea(s);
  const validator = VALIDATOR_BY_DEPT[s.department];
  idea.status = 'Not Feasible';
  idea.remarks = remarks;
  idea.validation = {
    validatedBy: validator,
    validatedAt,
    remarks,
    checklist: { ...OK_CHECKLIST, technicalFeasibility: false, riskAcceptable: false },
  };
  idea.timeline.push(ev('Marked Not Feasible', validator, validatedAt, remarks));
  return idea;
}

interface TaskSeed {
  assignedTo: string;
  assignedAt: string;
  targetDate: string;
  priority: TaskPriority;
  instructions: string;
  startedAt?: string; // moves task to In Progress
  completedAt?: string; // moves idea to Implemented
}

function executingIdea(s: SeedBase, validatedAt: string, remarks: string, task: TaskSeed): Idea {
  const idea = feasibleIdea(s, validatedAt, remarks);
  const validator = VALIDATOR_BY_DEPT[s.department];
  idea.status = 'In Execution';
  idea.executionTask = {
    assignedTo: task.assignedTo,
    assignedBy: validator,
    targetDate: task.targetDate,
    priority: task.priority,
    instructions: task.instructions,
    status: task.completedAt ? 'Completed' : task.startedAt ? 'In Progress' : 'Assigned',
    assignedAt: task.assignedAt,
    completedAt: task.completedAt,
  };
  idea.timeline.push(
    ev('Execution task assigned', validator, task.assignedAt, `Assigned to ${userName(task.assignedTo)} · ${task.priority} priority`)
  );
  if (task.startedAt) {
    idea.timeline.push(ev('Execution started', task.assignedTo, task.startedAt));
  }
  if (task.completedAt) {
    idea.status = 'Implemented';
    idea.timeline.push(ev('Execution completed — idea implemented', task.assignedTo, task.completedAt));
  }
  return idea;
}

function verifiedIdea(
  s: SeedBase,
  validatedAt: string,
  remarks: string,
  task: TaskSeed & { completedAt: string },
  verifiedAt: string
): Idea {
  const idea = executingIdea(s, validatedAt, remarks, task);
  const validator = VALIDATOR_BY_DEPT[s.department];
  const cmp = computeMrnComparison(idea)!;
  idea.status = 'Verified';
  idea.mrnVerification = {
    verifiedBy: validator,
    verifiedAt,
    baselineQuarter: cmp.baselineQuarter,
    postQuarter: cmp.postQuarter,
    baselineUnitCost: cmp.baselineUnitCost,
    actualUnitCost: cmp.actualUnitCost,
    actualAnnualSaving: cmp.actualAnnualSaving,
    variancePercent: cmp.variancePercent,
  };
  idea.timeline.push(
    ev('Savings verified against MRN', validator, verifiedAt, `${cmp.baselineQuarter} vs ${cmp.postQuarter} · realized annual saving confirmed`)
  );
  return idea;
}

export const SEED_IDEAS: Idea[] = [
  // ── Verified ────────────────────────────────────────────────────────────
  verifiedIdea(
    {
      id: 'CI-2025-0003',
      title: 'Thinner CRCA gauge for ODU cabinet panel (0.6 → 0.55 mm)',
      submitter: 'u-rnd-1',
      department: 'Research & Development',
      partCodes: ['AMB-SHM-01102'],
      description:
        'Structural simulation shows the outdoor cabinet panel retains required rigidity at 0.55 mm CRCA with an added stiffening rib. Reduces steel consumption per unit without affecting powder-coat finish.',
      type: 'Design Optimization',
      expectedCost: 455,
      createdAt: '2025-09-08T10:20:00',
      photo: photo('ODU Cabinet Panel', 'CRCA gauge reduction trial', '#0F766E'),
    },
    '2025-09-15T15:40:00',
    'Simulation report reviewed. Proceed with pilot batch and drop test.',
    {
      assignedTo: 'u-pro-1',
      assignedAt: '2025-09-22T11:00:00',
      targetDate: '2026-01-31',
      priority: 'High',
      instructions: 'Run pilot batch of 500 panels at 0.55 mm, complete drop and vibration tests, then release ECN.',
      startedAt: '2025-10-06T09:30:00',
      completedAt: '2026-01-22T17:10:00',
    },
    '2026-04-10T12:00:00'
  ),
  verifiedIdea(
    {
      id: 'CI-2025-0007',
      title: 'Alternate approved vendor for indoor display PCB',
      submitter: 'u-src-1',
      department: 'Sourcing',
      partCodes: ['AMB-PCB-03315'],
      description:
        'Second-source vendor quoted lower on the display PCB at same spec with better MOQ flexibility. Samples cleared functional and burn-in tests.',
      type: 'Supplier/Sourcing Change',
      expectedCost: 385,
      createdAt: '2025-10-05T09:10:00',
    },
    '2025-10-14T14:00:00',
    'Vendor audit score acceptable. Approve after PPAP sign-off.',
    {
      assignedTo: 'u-src-2',
      assignedAt: '2025-10-20T10:00:00',
      targetDate: '2026-02-28',
      priority: 'Medium',
      instructions: 'Complete PPAP with new vendor, phase in 30/70 split for one quarter, then full transition.',
      startedAt: '2025-11-03T09:00:00',
      completedAt: '2026-02-10T16:30:00',
    },
    '2026-04-12T11:15:00'
  ),
  verifiedIdea(
    {
      id: 'CI-2025-0011',
      title: 'Direct-from-mill procurement of grooved copper coils',
      submitter: 'u-pur-1',
      department: 'Purchase',
      partCodes: ['AMB-CTB-02201'],
      description:
        'Buying 9.52 mm grooved copper coil directly from the mill instead of through a converter removes one margin layer. Annual volume qualifies us for mill-direct pricing.',
      type: 'Supplier/Sourcing Change',
      expectedCost: 1165,
      createdAt: '2025-11-02T11:45:00',
      photo: photo('Copper Coil 9.52mm', 'Mill-direct procurement', '#B45309'),
    },
    '2025-11-10T16:20:00',
    'Commercially sound. Confirm mill lead times cover our safety stock policy.',
    {
      assignedTo: 'u-pur-2',
      assignedAt: '2025-11-17T10:30:00',
      targetDate: '2026-03-15',
      priority: 'High',
      instructions: 'Negotiate annual rate contract with mill, align logistics and inspection plan, cut over from converter.',
      startedAt: '2025-12-01T09:00:00',
      completedAt: '2026-03-05T15:00:00',
    },
    '2026-04-15T10:30:00'
  ),
  verifiedIdea(
    {
      id: 'CI-2025-0014',
      title: 'Lower-density EPS for IDU packaging set',
      submitter: 'u-pro-1',
      department: 'Process',
      partCodes: ['AMB-INS-06612'],
      description:
        'Transit trials show 18-density EPS with revised rib profile passes ISTA drop testing for the indoor unit, replacing the current 20-density moulding.',
      type: 'Packaging & Logistics',
      expectedCost: 104,
      createdAt: '2025-11-20T13:30:00',
    },
    '2025-11-28T10:10:00',
    'Transit trial data convincing. Ensure e-commerce channel packaging also revalidated.',
    {
      assignedTo: 'u-pro-2',
      assignedAt: '2025-12-04T11:00:00',
      targetDate: '2026-03-01',
      priority: 'Medium',
      instructions: 'Revalidate for e-commerce shipments, update packaging spec, switch moulding vendor tooling.',
      startedAt: '2025-12-15T09:30:00',
      completedAt: '2026-02-28T14:45:00',
    },
    '2026-04-18T09:45:00'
  ),
  verifiedIdea(
    {
      id: 'CI-2026-0002',
      title: 'Powder coating line energy optimization for chassis plates',
      submitter: 'u-pro-2',
      department: 'Process',
      partCodes: ['AMB-SHM-01118'],
      description:
        'Curing oven zone rebalancing plus low-bake powder chemistry cuts gas consumption per chassis base plate by roughly 20% and reduces conversion cost.',
      type: 'Power/Energy Optimization',
      expectedCost: 300,
      createdAt: '2026-01-06T10:00:00',
      photo: photo('Chassis Base Plate', 'Low-bake powder trial', '#475569'),
    },
    '2026-01-13T15:30:00',
    'Energy audit numbers verified with utilities team. Go ahead.',
    {
      assignedTo: 'u-pro-1',
      assignedAt: '2026-01-19T10:00:00',
      targetDate: '2026-04-30',
      priority: 'Medium',
      instructions: 'Qualify low-bake powder on salt-spray, rebalance oven zones, capture per-unit gas consumption for one month.',
      startedAt: '2026-02-02T09:00:00',
      completedAt: '2026-04-20T16:00:00',
    },
    '2026-07-05T11:00:00'
  ),
  verifiedIdea(
    {
      id: 'CI-2026-0005',
      title: 'Standardize self-tapping screws across IDU models',
      submitter: 'u-rnd-2',
      department: 'Research & Development',
      partCodes: ['AMB-FST-05501'],
      description:
        'Nine screw variants across indoor unit models can collapse into the single M4x12 pan-head variant, unlocking a volume-slab price and simplifying line-side kitting.',
      type: 'Design Optimization',
      expectedCost: 0.78,
      createdAt: '2026-01-15T09:40:00',
    },
    '2026-01-22T14:20:00',
    'Torque retention data OK across all housings. Approved.',
    {
      assignedTo: 'u-rnd-1',
      assignedAt: '2026-01-28T10:15:00',
      targetDate: '2026-04-15',
      priority: 'Low',
      instructions: 'Release ECNs across affected models and renegotiate slab pricing with fastener vendor.',
      startedAt: '2026-02-09T09:00:00',
      completedAt: '2026-04-08T13:30:00',
    },
    '2026-07-06T10:20:00'
  ),
  verifiedIdea(
    {
      id: 'CI-2026-0008',
      title: 'Approved regrind ABS blend for louvre set',
      submitter: 'u-sup-1',
      department: 'Supplier',
      partCodes: ['AMB-PLS-08812'],
      description:
        'Moulding partner can run the air deflector louvre set on a 30% certified regrind ABS blend with no visible finish change, reducing resin cost per set.',
      type: 'Scrap/Wastage Reduction',
      expectedCost: 80,
      createdAt: '2026-02-02T11:20:00',
      photo: photo('Louvre Set', '30% regrind ABS blend', '#7C3AED'),
    },
    '2026-02-09T16:00:00',
    'Colour-fastness and impact results acceptable. Limit regrind to certified in-house scrap only.',
    {
      assignedTo: 'u-sup-2',
      assignedAt: '2026-02-13T10:00:00',
      targetDate: '2026-05-31',
      priority: 'Medium',
      instructions: 'Set up regrind certification process at vendor, run 3-lot validation, update material spec.',
      startedAt: '2026-03-02T09:30:00',
      completedAt: '2026-05-12T15:20:00',
    },
    '2026-07-08T12:30:00'
  ),

  // ── Implemented (awaiting MRN verification) ─────────────────────────────
  executingIdea(
    {
      id: 'CI-2026-0012',
      title: 'Sensor harness connector consolidation',
      submitter: 'u-sup-2',
      department: 'Supplier',
      partCodes: ['AMB-WRH-07722'],
      description:
        'Coil and ambient sensor harnesses can share one 2-pin JST housing type instead of two variants, cutting connector spend and assembly errors.',
      type: 'Design Optimization',
      expectedCost: 52,
      createdAt: '2026-02-20T10:30:00',
    },
    '2026-02-27T15:00:00',
    'No thermal derating concern. Approved.',
    {
      assignedTo: 'u-sup-1',
      assignedAt: '2026-03-04T10:00:00',
      targetDate: '2026-06-15',
      priority: 'Medium',
      instructions: 'Align harness vendor tooling, revise drawings, deplete old connector stock before cutover.',
      startedAt: '2026-03-16T09:00:00',
      completedAt: '2026-05-30T16:40:00',
    }
  ),
  executingIdea(
    {
      id: 'CI-2026-0015',
      title: 'Optimized fin stock width for condenser coil',
      submitter: 'u-rnd-1',
      department: 'Research & Development',
      partCodes: ['AMB-HEX-09901'],
      description:
        'Re-nesting the fin die on 62 mm stock instead of 65 mm removes edge trim scrap on the 2-row condenser coil with identical heat-transfer area.',
      type: 'Raw Material Change',
      expectedCost: 2255,
      createdAt: '2026-03-04T09:50:00',
      photo: photo('Condenser Coil', 'Fin stock re-nesting', '#0369A1'),
    },
    '2026-03-11T14:30:00',
    'Performance-neutral per lab report. Approved.',
    {
      assignedTo: 'u-pro-1',
      assignedAt: '2026-03-17T11:00:00',
      targetDate: '2026-06-30',
      priority: 'High',
      instructions: 'Modify fin die, revalidate coil capacity on calorimeter, release revised BOM.',
      startedAt: '2026-04-01T09:00:00',
      completedAt: '2026-06-10T15:10:00',
    }
  ),
  executingIdea(
    {
      id: 'CI-2026-0018',
      title: 'Nested laser cutting for chassis base plate blanks',
      submitter: 'u-pro-1',
      department: 'Process',
      partCodes: ['AMB-SHM-01118'],
      description:
        'Common-line nesting of chassis blanks on the fiber laser improves GI sheet utilization from 78% to 86%, reducing per-part material cost.',
      type: 'Process Improvement',
      expectedCost: 298,
      createdAt: '2026-03-10T10:15:00',
    },
    '2026-03-17T16:10:00',
    'Nesting study verified. Coordinate with CI-2026-0002 changes on the same part.',
    {
      assignedTo: 'u-pro-2',
      assignedAt: '2026-03-23T10:30:00',
      targetDate: '2026-07-15',
      priority: 'Medium',
      instructions: 'Program nested cutting paths, update routing and standard cost, monitor edge quality for one month.',
      startedAt: '2026-04-06T09:00:00',
      completedAt: '2026-06-18T14:00:00',
    }
  ),
  executingIdea(
    {
      id: 'CI-2026-0021',
      title: 'Dual-sourcing of insulated suction line assembly',
      submitter: 'u-src-2',
      department: 'Sourcing',
      partCodes: ['AMB-CTB-02230'],
      description:
        'Qualifying a second brazing vendor for the suction line assembly creates negotiation leverage and de-risks single-source supply.',
      type: 'Supplier/Sourcing Change',
      expectedCost: 612,
      createdAt: '2026-03-18T11:40:00',
    },
    '2026-03-25T15:45:00',
    'Second source strategy aligned with commodity plan. Approved.',
    {
      assignedTo: 'u-src-1',
      assignedAt: '2026-03-31T10:00:00',
      targetDate: '2026-07-10',
      priority: 'Medium',
      instructions: 'Complete vendor qualification, leak-test audit, and award 40% share to the new source.',
      startedAt: '2026-04-13T09:30:00',
      completedAt: '2026-06-22T17:00:00',
    }
  ),

  // ── In Execution ────────────────────────────────────────────────────────
  executingIdea(
    {
      id: 'CI-2026-0023',
      title: 'BLDC indoor fan motor magnet grade optimization',
      submitter: 'u-rnd-2',
      department: 'Research & Development',
      partCodes: ['AMB-MTR-04401'],
      description:
        'Switching from N42 to N38 NdFeB magnets with a revised stator stack keeps efficiency within spec at lower magnet cost.',
      type: 'Design Optimization',
      expectedCost: 1090,
      createdAt: '2026-04-02T10:10:00',
      photo: photo('BLDC Fan Motor', 'Magnet grade N42 → N38', '#0F766E'),
    },
    '2026-04-09T14:50:00',
    'Efficiency margin adequate. Validate noise levels during pilot.',
    {
      assignedTo: 'u-rnd-1',
      assignedAt: '2026-04-15T10:00:00',
      targetDate: '2026-08-15',
      priority: 'High',
      instructions: 'Build 50 pilot motors, run efficiency and NVH validation, then release ECN to motor vendor.',
    }
  ),
  executingIdea(
    {
      id: 'CI-2026-0025',
      title: 'Selective conformal coating on inverter PCB',
      submitter: 'u-qua-1',
      department: 'Quality',
      partCodes: ['AMB-PCB-03301'],
      description:
        'Full-board conformal coating can move to selective robotic coating of high-risk zones only, cutting coating material and cycle time without field-failure exposure.',
      type: 'Process Improvement',
      expectedCost: 2795,
      createdAt: '2026-04-10T09:30:00',
    },
    '2026-04-17T15:20:00',
    'Zonal risk map reviewed with reliability team. Approved with humidity chamber revalidation.',
    {
      assignedTo: 'u-qua-2',
      assignedAt: '2026-04-23T10:30:00',
      targetDate: '2026-08-30',
      priority: 'Medium',
      instructions: 'Define selective coating masks, run 96-hour humidity bias test, update PCB vendor work instruction.',
      startedAt: '2026-05-05T09:00:00',
    }
  ),
  executingIdea(
    {
      id: 'CI-2026-0027',
      title: 'Returnable packaging for ODU fan motors',
      submitter: 'u-pur-2',
      department: 'Purchase',
      partCodes: ['AMB-MTR-04412'],
      description:
        'Replacing single-use corrugated boxes with returnable plastic totes for the local motor vendor cuts packaging cost per motor across the loop.',
      type: 'Packaging & Logistics',
      expectedCost: 958,
      createdAt: '2026-04-20T11:00:00',
    },
    '2026-04-27T16:30:00',
    'Loop economics work above 300 km only for this vendor. Approved for local vendor lane.',
    {
      assignedTo: 'u-pur-1',
      assignedAt: '2026-05-04T10:00:00',
      targetDate: '2026-09-10',
      priority: 'Low',
      instructions: 'Procure 400 totes, set up return logistics with milk-run, track tote loss rate for a quarter.',
    }
  ),
  executingIdea(
    {
      id: 'CI-2026-0029',
      title: 'Drain pan foam die-cut nesting improvement',
      submitter: 'u-pro-2',
      department: 'Process',
      partCodes: ['AMB-INS-06620'],
      description:
        'Rotating the die-cut layout of the PE foam drain pan insulation increases sheet yield from 11 to 13 pieces per sheet.',
      type: 'Scrap/Wastage Reduction',
      expectedCost: 38,
      createdAt: '2026-05-02T10:20:00',
    },
    '2026-05-09T14:10:00',
    'Straightforward yield gain. Approved.',
    {
      assignedTo: 'u-pro-1',
      assignedAt: '2026-05-13T10:00:00',
      targetDate: '2026-08-05',
      priority: 'Low',
      instructions: 'Order revised cutting die, validate adhesive coverage on new layout, update standard cost.',
      startedAt: '2026-05-25T09:00:00',
    }
  ),
  executingIdea(
    {
      id: 'CI-2026-0031',
      title: 'Copper tube coil length standardization (15 m → 25 m)',
      submitter: 'u-src-1',
      department: 'Sourcing',
      partCodes: ['AMB-CTB-02214'],
      description:
        'Moving the 6.35 mm plain tube to 25 m coils reduces per-metre conversion charges and brazed joints per unit on the tubing line.',
      type: 'Process Improvement',
      expectedCost: 868,
      createdAt: '2026-05-16T09:45:00',
    },
    '2026-05-23T15:00:00',
    'Line-side decoiler capacity confirmed. Approved.',
    {
      assignedTo: 'u-src-2',
      assignedAt: '2026-05-28T10:00:00',
      targetDate: '2026-09-01',
      priority: 'Medium',
      instructions: 'Amend supply contract to 25 m coils, install second decoiler, retrain tubing line operators.',
    }
  ),

  // ── Feasible (awaiting task assignment) ─────────────────────────────────
  feasibleIdea(
    {
      id: 'CI-2026-0033',
      title: 'Aluminium conductor option for interconnect harness',
      submitter: 'u-sup-1',
      department: 'Supplier',
      partCodes: ['AMB-WRH-07701'],
      description:
        'The 4-core interconnect cable can move to aluminium conductor with upsized cross-section, meeting IS 694 while cutting copper exposure on 5 m of cable per unit.',
      type: 'Raw Material Change',
      expectedCost: 352,
      createdAt: '2026-05-10T10:40:00',
      photo: photo('Interconnect Harness', 'Al conductor evaluation', '#B45309'),
    },
    '2026-05-18T15:30:00',
    'Termination reliability plan is solid; crimp validation mandatory during execution.'
  ),
  feasibleIdea(
    {
      id: 'CI-2026-0035',
      title: 'Zinc-flake vendor consolidation for hex flange bolts',
      submitter: 'u-pur-1',
      department: 'Purchase',
      partCodes: ['AMB-FST-05515'],
      description:
        'Consolidating three coating vendors into one zinc-flake applicator with committed volumes yields a lower applied cost per bolt.',
      type: 'Supplier/Sourcing Change',
      expectedCost: 2.2,
      createdAt: '2026-05-22T11:15:00',
    },
    '2026-06-01T14:00:00',
    'Consolidation risk acceptable with dual-line applicator. Approved.'
  ),
  feasibleIdea(
    {
      id: 'CI-2026-0037',
      title: 'ODU grille PP masterbatch optimization',
      submitter: 'u-qua-2',
      department: 'Quality',
      partCodes: ['AMB-PLS-08820'],
      description:
        'Reducing carbon-black masterbatch loading from 4% to 2.5% with a UV stabilizer package keeps weathering performance while lowering compound cost.',
      type: 'Raw Material Change',
      expectedCost: 69,
      createdAt: '2026-06-04T10:00:00',
    },
    '2026-06-12T15:45:00',
    'QUV accelerated weathering results within spec. Approved.'
  ),
  feasibleIdea(
    {
      id: 'CI-2026-0039',
      title: 'Compressor grommet shore hardness revision',
      submitter: 'u-rnd-1',
      department: 'Research & Development',
      partCodes: ['AMB-FST-05528'],
      description:
        'Moving grommets from 60A to 55A shore EPDM improves vibration isolation and allows a simpler mould, reducing kit cost.',
      type: 'Design Optimization',
      expectedCost: 25.5,
      createdAt: '2026-06-15T09:30:00',
    },
    '2026-06-23T14:20:00',
    'NVH data supports the change. Approved.'
  ),

  // ── Not Feasible ────────────────────────────────────────────────────────
  rejectedIdea(
    {
      id: 'CI-2025-0009',
      title: 'Aluminium suction line in place of copper',
      submitter: 'u-src-2',
      department: 'Sourcing',
      partCodes: ['AMB-CTB-02230'],
      description:
        'Aluminium suction line assemblies quoted 40% cheaper than copper. Proposal to switch with transition joints at compressor end.',
      type: 'Raw Material Change',
      expectedCost: 390,
      createdAt: '2025-10-20T10:30:00',
    },
    '2025-11-01T15:10:00',
    'Cu-Al transition joints show unacceptable leak rates in our field data; service network cannot braze aluminium in the field. Rejected on reliability risk.'
  ),
  rejectedIdea(
    {
      id: 'CI-2026-0010',
      title: 'Single-row condenser coil for 1.0T models',
      submitter: 'u-rnd-2',
      department: 'Research & Development',
      partCodes: ['AMB-HEX-09901'],
      description:
        'A single-row condenser with higher fin density could replace the 2-row coil on the 1.0T fixed-speed platform.',
      type: 'Design Optimization',
      expectedCost: 1950,
      createdAt: '2026-02-10T11:00:00',
    },
    '2026-02-19T16:00:00',
    'Calorimeter results miss ISEER 5-star threshold by 0.2. Cannot compromise energy label. Not feasible in current form.'
  ),
  rejectedIdea(
    {
      id: 'CI-2026-0026',
      title: 'Thinner IDU front panel wall (2.5 → 2.0 mm)',
      submitter: 'u-pro-1',
      department: 'Process',
      partCodes: ['AMB-PLS-08801'],
      description:
        'Reducing front panel nominal wall to 2.0 mm cuts ABS consumption ~15% and shortens moulding cycle time.',
      type: 'Design Optimization',
      expectedCost: 295,
      createdAt: '2026-04-12T10:45:00',
    },
    '2026-04-21T15:30:00',
    'Trial mouldings show sink marks near clip bosses and 30% higher warpage rejection. High-gloss A-surface cannot absorb this. Rejected.'
  ),
  rejectedIdea(
    {
      id: 'CI-2026-0034',
      title: 'Non-branded IPM module for inverter PCB',
      submitter: 'u-pur-2',
      department: 'Purchase',
      partCodes: ['AMB-PCB-03301'],
      description:
        'A domestic IPM module is quoted 22% below the incumbent branded module for the inverter control board.',
      type: 'Supplier/Sourcing Change',
      expectedCost: 2620,
      createdAt: '2026-05-15T09:50:00',
    },
    '2026-05-26T14:40:00',
    'Vendor has no field reliability data at our ambient profile and no HALT results. Compressor drive failure cost far exceeds the saving. Rejected pending 12-month field data.'
  ),

  // ── Pending Validation ──────────────────────────────────────────────────
  pendingIdea({
    id: 'CI-2026-0040',
    title: 'In-house hydrophilic coating for evaporator fins',
    submitter: 'u-pro-2',
    department: 'Process',
    partCodes: ['AMB-HEX-09912'],
    description:
      'Installing an in-line hydrophilic coating station lets us buy uncoated fin stock and coat in-house, cutting the coating premium currently paid to the fin supplier.',
    type: 'Process Improvement',
    expectedCost: 1820,
    createdAt: '2026-06-28T10:30:00',
    photo: photo('Evaporator Coil', 'In-house fin coating', '#0369A1'),
  }),
  pendingIdea({
    id: 'CI-2026-0041',
    title: 'Stepper motor gearbox material change (POM → PBT)',
    submitter: 'u-rnd-1',
    department: 'Research & Development',
    partCodes: ['AMB-MTR-04420'],
    description:
      'Louvre stepper gearbox gears in glass-filled PBT match POM wear life at our torque levels per vendor DOE, at lower resin cost.',
    type: 'Raw Material Change',
    expectedCost: 137,
    createdAt: '2026-07-02T09:20:00',
  }),
  pendingIdea({
    id: 'CI-2026-0042',
    title: 'Localize silicone sleeve for compressor terminal harness',
    submitter: 'u-sup-2',
    department: 'Supplier',
    partCodes: ['AMB-WRH-07715'],
    description:
      'The imported silicone sleeve on the compressor terminal harness has two qualified domestic equivalents; localization removes import duty and freight.',
    type: 'Supplier/Sourcing Change',
    expectedCost: 84,
    createdAt: '2026-07-05T11:10:00',
  }),
  pendingIdea({
    id: 'CI-2026-0043',
    title: 'Combined sea shipment for display and driver PCBs',
    submitter: 'u-pur-1',
    department: 'Purchase',
    partCodes: ['AMB-PCB-03315', 'AMB-PCB-03322'],
    description:
      'Display and ODU driver PCBs ship from the same EMS cluster; consolidated fortnightly sea shipments replace separate air freight, cutting landed cost on both.',
    type: 'Packaging & Logistics',
    expectedCost: 1152,
    createdAt: '2026-07-08T10:00:00',
  }),
  pendingIdea({
    id: 'CI-2026-0044',
    title: 'Engineered NBR grade with 11 mm wall for insulation tube',
    submitter: 'u-qua-1',
    department: 'Quality',
    partCodes: ['AMB-INS-06601'],
    description:
      'A higher-performance NBR foam grade achieves the same thermal resistance at 11 mm wall versus 13 mm, reducing material per metre.',
    type: 'Raw Material Change',
    expectedCost: 89,
    createdAt: '2026-07-10T09:40:00',
    photo: photo('NBR Insulation', '11 mm wall trial sample', '#334155'),
  }),
  pendingIdea({
    id: 'CI-2026-0045',
    title: 'Rail-road multimodal freight for twin rotary compressors',
    submitter: 'u-src-1',
    department: 'Sourcing',
    partCodes: ['AMB-CMP-00425'],
    description:
      'Moving twin rotary compressor inbound freight from full road to rail-road multimodal cuts logistics cost per unit with one extra day of transit absorbed by safety stock.',
    type: 'Packaging & Logistics',
    expectedCost: 8825,
    createdAt: '2026-07-12T10:50:00',
  }),
];
