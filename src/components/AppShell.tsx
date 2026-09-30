import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import { RoleBadge } from './StatusBadge';
import { Toasts } from './Toasts';
import { formatDateTime, initials } from '../utils/format';

/**
 * Page titles keyed by route prefix. Longest-prefix wins so that, e.g.,
 * `/co/dashboard` is not shadowed by a shorter `/co` entry.
 */
export const PAGE_TITLES: [string, string][] = [
  ['/coin', 'COIN — Module Selector'],
  ['/co/dashboard', 'CO: Cost Optimization'],
  ['/ci/dashboard', 'CI: Cost Innovation'],
  ['/ci/all-ideas', 'All Ideas'],
  ['/dashboard', 'Dashboard'],
  ['/all-ideas', 'All Ideas'],
  ['/validation', 'Validation Queue'],
  ['/execution', 'Execution & Tasks'],
  ['/mrn', 'MRN Verification'],
  ['/my-ideas', 'My Ideas'],
  ['/submit', 'Submit Idea'],
  ['/ideas/', 'Idea Detail'],
];

function resolveTitle(pathname: string): string {
  // Prefer the longest matching prefix so nested module routes win.
  const match = PAGE_TITLES.filter(([p]) => pathname.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0];
  return match?.[1] ?? 'Cost Innovation Hub';
}

/**
 * Shared application shell: sticky header (title, notifications, user menu,
 * logout), responsive sidebar mounting, main content area, and toasts.
 * The concrete sidebar is supplied by each module layout via `sidebar`.
 */
export function AppShell({ sidebar }: { sidebar: ReactNode }) {
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

  const userSubtitle = user.submitterType === 'vendor' ? user.organization : user.department;
  const title = resolveTitle(location.pathname);

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

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">{sidebar}</aside>
      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="glass-panel sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
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
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-surface shadow-lifted">
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
                <p className="text-xs text-slate-500">{userSubtitle}</p>
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
