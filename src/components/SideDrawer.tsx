import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Header content (e.g. compact idea title + ID). */
  title: ReactNode;
  /** Scrollable body content. */
  children: ReactNode;
  /** Sticky action bar pinned to the bottom of the drawer. */
  footer?: ReactNode;
}

/**
 * Right-side slide-over drawer with a dimmed backdrop. 480px wide on desktop,
 * full-width on mobile. Closes on backdrop click or Escape.
 */
export function SideDrawer({ open, onClose, title, children, footer }: SideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-surface shadow-lifted">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">{title}</div>
          <button className="rounded p-1 text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 px-5 py-4">{footer}</div>}
      </aside>
    </div>
  );
}
