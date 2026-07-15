import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore } from '../store/toast';

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

export function Toasts() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lifted animate-[toast-in_.2s_ease-out]"
        >
          <div className="mt-0.5 shrink-0">{ICONS[t.type]}</div>
          <p className="flex-1 text-sm text-slate-700">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
