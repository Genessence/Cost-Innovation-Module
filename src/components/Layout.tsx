import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClipboardCheck,
  FilePlus2,
  FileSearch,
  IndianRupee,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { AppShell } from './AppShell';

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
    <div className="flex h-full flex-col bg-primary-dark text-teal-50">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-accent/20">
          <IndianRupee size={18} className="text-primary-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">Cost Innovation Hub</p>
          <p className="text-[11px] text-teal-200/70">Ideation & Savings Portal</p>
        </div>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-teal-100/80 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
            {to === '/validation' && pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-semibold text-amber-950">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-medium text-white">{user.name}</p>
        <p className="truncate text-xs text-teal-200/70">{user.designation}</p>
      </div>
    </div>
  );

  return <AppShell sidebar={sidebar} />;
}
