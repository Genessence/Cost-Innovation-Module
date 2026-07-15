import { useState } from 'react';
import { Expand, X } from 'lucide-react';

/** Clickable photo thumbnail that opens a full-screen lightbox. */
export function PhotoWithLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-lg border border-slate-200"
      >
        <img src={src} alt={alt} className="h-44 w-full object-cover transition-transform group-hover:scale-[1.02]" />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-slate-900/60 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Expand size={12} /> View
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-6" onClick={() => setOpen(false)}>
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <img src={src} alt={alt} className="max-h-full max-w-4xl rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
