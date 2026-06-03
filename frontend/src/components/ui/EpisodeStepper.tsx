'use client';

export function EpisodeStepper({
  progress,
  total,
  onDec,
  onInc,
  busy,
}: {
  progress: number;
  total: number | null;
  onDec: () => void;
  onInc: () => void;
  busy?: boolean;
}) {
  const atMax = total != null && progress >= total;

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-md border border-ink-line text-washi-200 transition-colors hover:bg-ink-750 hover:text-washi-50 disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <div className="inline-flex items-center gap-3">
      <button className={btn} onClick={onDec} disabled={busy || progress <= 0} aria-label="One episode back">
        −
      </button>
      <span className="min-w-[72px] text-center font-mono text-lg tabular-nums text-washi-50">
        {progress}
        <span className="text-washi-400"> / {total ?? '?'}</span>
      </span>
      <button
        className={`${btn} ${atMax ? '' : 'border-shu-500/40 text-shu-400 hover:bg-shu-500/10'}`}
        onClick={onInc}
        disabled={busy || atMax}
        aria-label="One episode forward"
      >
        +
      </button>
    </div>
  );
}
