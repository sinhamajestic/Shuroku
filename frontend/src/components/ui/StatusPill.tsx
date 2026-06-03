'use client';

import { useState, useRef, useEffect } from 'react';
import { STATUS_META, type WatchStatus } from '@/types/api';

const ORDER: WatchStatus[] = ['WATCHING', 'COMPLETED', 'PLAN_TO_WATCH', 'PAUSED'];

export function StatusPill({
  value,
  onChange,
}: {
  value: WatchStatus;
  onChange: (s: WatchStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const meta = STATUS_META[value];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-2 rounded-full border px-3 font-mono text-xs uppercase tracking-wide transition-colors duration-200"
        style={{
          borderColor: meta.hue,
          color: meta.hue,
          background: `color-mix(in srgb, ${meta.hue} 12%, transparent)`,
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.hue }} />
        {meta.label}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-48 overflow-hidden rounded-md border border-ink-line bg-ink-800 shadow-e2"
        >
          {ORDER.map((s) => {
            const m = STATUS_META[s];
            const active = s === value;
            return (
              <li key={s}>
                <button
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-ink-750 ${
                    active ? 'text-washi-50' : 'text-washi-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.hue }} />
                  {m.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
