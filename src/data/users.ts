import type { User } from '../types';

export const USERS: User[] = [
  // ── Submitters (2 per department) ──────────────────────────────
  { id: 'u-rnd-1', name: 'Arjun Mehta', email: 'arjun.mehta@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Research & Development', designation: 'Design Engineer' },
  { id: 'u-rnd-2', name: 'Kavya Iyer', email: 'kavya.iyer@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Research & Development', designation: 'R&D Engineer' },
  { id: 'u-src-1', name: 'Rohan Deshmukh', email: 'rohan.deshmukh@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Sourcing', designation: 'Sourcing Executive' },
  { id: 'u-src-2', name: 'Sneha Kulkarni', email: 'sneha.kulkarni@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Sourcing', designation: 'Category Analyst' },
  { id: 'u-pur-1', name: 'Vikram Singh', email: 'vikram.singh@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Purchase', designation: 'Purchase Officer' },
  { id: 'u-pur-2', name: 'Ananya Sharma', email: 'ananya.sharma@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Purchase', designation: 'Buyer' },
  { id: 'u-qua-1', name: 'Karthik Raman', email: 'karthik.raman@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Quality', designation: 'Quality Engineer' },
  { id: 'u-qua-2', name: 'Divya Nair', email: 'divya.nair@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Quality', designation: 'QA Analyst' },
  { id: 'u-pro-1', name: 'Manish Patel', email: 'manish.patel@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Process', designation: 'Process Engineer' },
  { id: 'u-pro-2', name: 'Ritu Agarwal', email: 'ritu.agarwal@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Process', designation: 'Industrial Engineer' },
  { id: 'u-sup-1', name: 'Suresh Reddy', email: 'suresh.reddy@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Supplier', designation: 'Supplier Development Engineer' },
  { id: 'u-sup-2', name: 'Pooja Verma', email: 'pooja.verma@company.in', password: 'demo123', role: 'submitter', submitterType: 'employee', department: 'Supplier', designation: 'Vendor Coordinator' },

  // ── Vendor Submitters (external organizations) ──────────────────
  { id: 'v-ext-1', name: 'Rajiv Malhotra', email: 'rajiv@polyflex.in', password: 'demo123', role: 'submitter', submitterType: 'vendor', organization: 'Polyflex Industries', designation: 'Key Account Manager' },
  { id: 'v-ext-2', name: 'Sunita Agarwal', email: 'sunita@supremecopper.in', password: 'demo123', role: 'submitter', submitterType: 'vendor', organization: 'Supreme Copper Ltd', designation: 'Technical Sales Engineer' },
  { id: 'v-ext-3', name: 'Harish Nambiar', email: 'harish@indopacktech.in', password: 'demo123', role: 'submitter', submitterType: 'vendor', organization: 'Indo Pack Tech', designation: 'Business Development Manager' },
  { id: 'v-ext-4', name: 'Priya Venkatesh', email: 'priya@globalfasteners.in', password: 'demo123', role: 'submitter', submitterType: 'vendor', organization: 'Global Fasteners Co', designation: 'Regional Sales Head' },

  // ── Validators (1 per department) ──────────────────────────────
  { id: 'v-rnd', name: 'Dr. Rajesh Krishnan', email: 'rajesh.krishnan@company.in', password: 'demo123', role: 'validator', department: 'Research & Development', designation: 'Head — R&D' },
  { id: 'v-src', name: 'Meera Pillai', email: 'meera.pillai@company.in', password: 'demo123', role: 'validator', department: 'Sourcing', designation: 'GM — Sourcing' },
  { id: 'v-pur', name: 'Amitabh Joshi', email: 'amitabh.joshi@company.in', password: 'demo123', role: 'validator', department: 'Purchase', designation: 'DGM — Purchase' },
  { id: 'v-qua', name: 'Lakshmi Subramaniam', email: 'lakshmi.s@company.in', password: 'demo123', role: 'validator', department: 'Quality', designation: 'Head — Quality' },
  { id: 'v-pro', name: 'Nitin Chandra', email: 'nitin.chandra@company.in', password: 'demo123', role: 'validator', department: 'Process', designation: 'Plant Head — Process' },
  { id: 'v-sup', name: 'Farida Khan', email: 'farida.khan@company.in', password: 'demo123', role: 'validator', department: 'Supplier', designation: 'GM — Supplier Quality' },
];

export function getUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function userName(id: string): string {
  return getUser(id)?.name ?? 'Unknown';
}
