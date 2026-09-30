import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import { AppShell } from './AppShell';
import { ModuleSidebar, type ModuleNavItem } from './ModuleSidebar';

const CO_NAV: ModuleNavItem[] = [
  { to: '/co/dashboard', label: 'CO Dashboard', icon: LayoutDashboard },
  { to: '/mrn', label: 'MRN Verification', icon: ShieldCheck },
];

/** Layout wrapper for the Cost Optimization (CO) module. */
export function CoLayout() {
  return <AppShell sidebar={<ModuleSidebar module="CO" nav={CO_NAV} />} />;
}
