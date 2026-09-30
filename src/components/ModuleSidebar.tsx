import { useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ArrowLeftRight, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import amberLogo from '../assets/amber-logo.png';

export interface ModuleNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface ModuleConfig {
  /** Monogram badge classes. */
  badge: string;
  /** Active nav-item fill (module accent). */
  navActive: string;
  /** Hover tint for idle nav items. */
  navHover: string;
}

/*
 * Both modules share the same warm frosted rail; they differ only by a small
 * accent — CI leads with peach (the app identity), CO with a muted dusty blue
 * so the two cost tracks stay visually distinguishable.
 */
const MODULES: Record<'CO' | 'CI', ModuleConfig> = {
  CO: {
    badge: 'bg-blue-600 text-white',
    navActive: 'bg-blue-600 text-white shadow-card',
    navHover: 'hover:bg-blue-50 hover:text-slate-900',
  },
  CI: {
    badge: 'bg-primary text-white',
    navActive: 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-card',
    navHover: 'hover:bg-primary-light/60 hover:text-slate-900',
  },
};

const MODULE_NAMES: Record<'CO' | 'CI', string> = {
  CO: 'Cost Optimization',
  CI: 'Cost Innovation',
};

/**
 * Shared sidebar for the CO and CI modules: COIN wordmark + module monogram at
 * the top, module nav in the middle, and the user identity with a
 * "Switch module" link back to the COIN selector at the bottom.
 */
export function ModuleSidebar({ module, nav }: { module: 'CO' | 'CI'; nav: ModuleNavItem[] }) {
  const user = useAuthStore((s) => s.currentUser)!;
  const ideas = useAppStore((s) => s.ideas);
  const cfg = MODULES[module];

  const pendingCount = useMemo(() => ideas.filter((i) => i.status === 'Pending Validation').length, [ideas]);

  return (
    <div className="flex h-full flex-col glass-sidebar text-slate-700">
      <div className="px-5 py-5">
        <img src={amberLogo} alt="Amber" className="h-6 w-auto" />
        <div className="mt-3 flex items-center gap-2">
          <p className="text-sm font-semibold leading-tight text-slate-900">COIN</p>
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold leading-none ${cfg.badge}`}>{module}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{MODULE_NAMES[module]}</p>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? cfg.navActive : `text-slate-600 ${cfg.navHover}`
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
        <Link
          to="/coin"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-light/70 px-2.5 py-1.5 text-xs font-medium text-primary-dark transition-colors hover:bg-primary-light"
        >
          <ArrowLeftRight size={13} />
          Switch module
        </Link>
      </div>
    </div>
  );
}
