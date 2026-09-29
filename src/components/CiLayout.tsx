import { ClipboardCheck, FileSearch, LayoutDashboard, ListChecks } from 'lucide-react';
import { AppShell } from './AppShell';
import { ModuleSidebar, type ModuleNavItem } from './ModuleSidebar';

const CI_NAV: ModuleNavItem[] = [
  { to: '/ci/dashboard', label: 'CI Dashboard', icon: LayoutDashboard },
  { to: '/ci/all-ideas', label: 'All Ideas', icon: FileSearch },
  { to: '/validation', label: 'Validation Queue', icon: ClipboardCheck },
  { to: '/execution', label: 'Execution', icon: ListChecks },
];

/** Layout wrapper for the Cost Innovation (CI) module. */
export function CiLayout() {
  return <AppShell sidebar={<ModuleSidebar module="CI" nav={CI_NAV} />} />;
}
