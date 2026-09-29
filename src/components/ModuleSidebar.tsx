import { useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ArrowLeftRight, Coins, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';

export interface ModuleNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface ModuleConfig {
  /** Sidebar background (dark, module-tinted). */
  bg: string;
  /** Icon tile background. */
  iconTile: string;
  /** Icon color. */
  iconColor: string;
  /** Monogram badge classes. */
  badge: string;
  /** Muted text color for subtitles. */
  muted: string;
  /** Idle nav item text color. */
  navIdle: string;
}

const MODULES: Record<'CO' | 'CI', ModuleConfig> = {
  CO: {
    bg: 'bg-blue-950',
    iconTile: 'bg-blue-500/20',
    iconColor: 'text-blue-300',
    badge: 'bg-blue-600 text-white',
    muted: 'text-blue-200/70',
    navIdle: 'text-blue-100/80',
  },
  CI: {
    bg: 'bg-primary-dark',
    iconTile: 'bg-primary-accent/20',
    iconColor: 'text-primary-accent',
    badge: 'bg-teal-500 text-white',
    muted: 'text-teal-200/70',
    navIdle: 'text-teal-100/80',
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
    <div className={`flex h-full flex-col ${cfg.bg} text-white`}>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.iconTile}`}>
          <Coins size={18} className={cfg.iconColor} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold leading-tight text-white">COIN</p>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold leading-none ${cfg.badge}`}>{module}</span>
          </div>
          <p className={`truncate text-[11px] ${cfg.muted}`}>{MODULE_NAMES[module]}</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : `${cfg.navIdle} hover:bg-white/5 hover:text-white`
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
        <p className={`truncate text-xs ${cfg.muted}`}>{user.designation}</p>
        <Link
          to="/coin"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
        >
          <ArrowLeftRight size={13} />
          Switch module
        </Link>
      </div>
    </div>
  );
}
