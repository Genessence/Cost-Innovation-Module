import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClipboardCheck,
  FilePlus2,
  FileSearch,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { AppShell } from './AppShell';
import amberLogo from '../assets/amber-logo.png';

const SUBMITTER_NAV = [
  { to: '/my-ideas', label: 'My Ideas', icon: Lightbulb },
  { to: '/submit', label: 'Submit Idea', icon: FilePlus2 },
];

const VALIDATOR_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/all-ideas', label: 'All Ideas', icon: FileSearch },
  { to: '/validation', label: 'Validation Queue', icon: ClipboardCheck },
  { to: '/execution', label: 'Execution', icon: ListChecks },
  { to: '/mrn', label: 'MRN Verification', icon: ShieldCheck },
];

/**
 * Combined layout used by submitter screens and the secondary combined
 * validator dashboard. Module-specific validator flows use CoLayout / CiLayout.
 */
export function Layout() {
  const user = useAuthStore((s) => s.currentUser)!;
  const ideas = useAppStore((s) => s.ideas);

  const nav = user.role === 'validator' ? VALIDATOR_NAV : SUBMITTER_NAV;
  const pendingCount = useMemo(
    () => (user.role === 'validator' ? ideas.filter((i) => i.status === 'Pending Validation').length : 0),
    [ideas, user.role]
  );

  const sidebar = (
    <div className="flex h-full flex-col glass-sidebar text-slate-700">
      <div className="px-5 py-5">
        <img src={amberLogo} alt="Amber" className="h-6 w-auto" />
        <div className="mt-3">
          <p className="text-sm font-semibold leading-tight text-slate-900">Cost Innovation Hub</p>
          <p className="text-[11px] text-slate-500">Ideation & Savings Portal</p>
        </div>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-card'
                  : 'text-slate-600 hover:bg-primary-light/60 hover:text-slate-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
            {to === '/validation' && pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200/70 px-5 py-4">
        <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{user.designation}</p>
      </div>
    </div>
  );

  return <AppShell sidebar={sidebar} />;
}
