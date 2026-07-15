import { useMemo, useRef, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ClipboardCheck,
  FilePlus2,
  FileSearch,
  IndianRupee,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { RoleBadge } from './StatusBadge';
import { Toasts } from './Toasts';
import { formatDateTime, initials } from '../utils/format';

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

const PAGE_TITLES: [string, string][] = [
  ['/dashboard', 'Dashboard'],
  ['/all-ideas', 'All Ideas'],
  ['/validation', 'Validation Queue'],
  ['/execution', 'Execution & Tasks'],
  ['/mrn', 'MRN Verification'],
  ['/my-ideas', 'My Ideas'],
  ['/submit', 'Submit Idea'],
  ['/ideas/', 'Idea Detail'],
];

export function Layout() {
  const user = useAuthStore((s) => s.currentUser)!;
  const logout = useAuthStore((s) => s.logout);
  const ideas = useAppStore((s) => s.ideas);
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationsRead);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const nav = user.role === 'validator' ? VALIDATOR_NAV : SUBMITTER_NAV;
  const title = PAGE_TITLES.find(([p]) => location.pathname.startsWith(p))?.[1] ?? 'Cost Innovation Hub';

  const myNotifications = useMemo(
    () => notifications.filter((n) => n.userId === user.id).slice(0, 12),
    [notifications, user.id]
  );
  const unread = myNotifications.filter((n) => !n.read).length;
  const pendingCount = useMemo(
    () => (user.role === 'validator' ? ideas.filter((i) => i.status === 'Pending Validation').length : 0),
    [ideas, user.role]
  );
  const badgeCount = unread + pendingCount;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => setMobileNavOpen(false), [location.pathname]);

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

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">{sidebar}</aside>
      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div ref={bellRef} className="relative">
              <button
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                onClick={() => {
                  setBellOpen((o) => !o);
                  if (!bellOpen && unread > 0) markRead(user.id);
                }}
                aria-label="Notifications"
              >
                <Bell size={19} />
                {badgeCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {badgeCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lifted">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <button className="rounded p-1 text-slate-400 hover:bg-slate-100" onClick={() => setBellOpen(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {user.role === 'validator' && pendingCount > 0 && (
                      <button
                        className="block w-full border-b border-slate-100 bg-amber-50/60 px-4 py-3 text-left hover:bg-amber-50"
                        onClick={() => {
                          setBellOpen(false);
                          navigate('/validation');
                        }}
                      >
                        <p className="text-sm font-medium text-amber-800">
                          {pendingCount} idea{pendingCount > 1 ? 's' : ''} pending validation
                        </p>
                        <p className="text-xs text-amber-700/70">Open the validation queue</p>
                      </button>
                    )}
                    {myNotifications.length === 0 && pendingCount === 0 && (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
                    )}
                    {myNotifications.map((n) => (
                      <button
                        key={n.id}
                        className="block w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50"
                        onClick={() => {
                          setBellOpen(false);
                          navigate(`/ideas/${n.ideaId}`);
                        }}
                      >
                        <p className="text-sm text-slate-700">{n.message}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {initials(user.name)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-tight text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.department}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
            <button
              className="flex items-center gap-1.5 rounded-lg p-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  );
}
