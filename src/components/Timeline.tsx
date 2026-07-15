import { CheckCircle2, Circle, FileUp, PlayCircle, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import type { TimelineEvent } from '../types';
import { formatDateTime } from '../utils/format';

function iconFor(event: string) {
  if (event.includes('submitted')) return { Icon: FileUp, cls: 'bg-slate-100 text-slate-600' };
  if (event.includes('Not Feasible')) return { Icon: XCircle, cls: 'bg-red-50 text-red-600' };
  if (event.includes('Feasible')) return { Icon: UserCheck, cls: 'bg-teal-50 text-teal-700' };
  if (event.includes('assigned')) return { Icon: Circle, cls: 'bg-blue-50 text-blue-600' };
  if (event.includes('started')) return { Icon: PlayCircle, cls: 'bg-blue-50 text-blue-600' };
  if (event.includes('implemented') || event.includes('completed'))
    return { Icon: CheckCircle2, cls: 'bg-indigo-50 text-indigo-600' };
  if (event.includes('verified') || event.includes('Verified'))
    return { Icon: ShieldCheck, cls: 'bg-emerald-50 text-emerald-600' };
  return { Icon: Circle, cls: 'bg-slate-100 text-slate-500' };
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
      {events.map((e, idx) => {
        const { Icon, cls } = iconFor(e.event);
        return (
          <li key={idx} className="relative flex gap-3.5">
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${cls}`}>
              <Icon size={16} />
            </span>
            <div className="pt-0.5">
              <p className="text-sm font-medium text-slate-800">{e.event}</p>
              <p className="text-xs text-slate-500">
                {e.actor} · {formatDateTime(e.timestamp)}
              </p>
              {e.note && <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{e.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
