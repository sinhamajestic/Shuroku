'use client';

import type { Source } from '@/types/api';

// Chip is a container div; the link and the optional delete button are siblings,
// so we never nest a <button> inside an <a> (invalid HTML / breaks a11y).
export function SourceChip({ source, onDelete }: { source: Source; onDelete?: () => void }) {
  const isPaid = source.kind === 'PAID';
  const style = {
    borderColor: isPaid ? 'rgba(126,155,90,0.4)' : 'rgba(138,127,115,0.4)',
    background: isPaid ? 'rgba(126,155,90,0.10)' : 'rgba(138,127,115,0.08)',
    color: isPaid ? '#9DBE74' : '#B7AC9C',
  };

  return (
    <span className="group inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm" style={style}>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
        <span className="font-medium">{source.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </a>
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label={`Remove ${source.label}`}
          className="ml-1 text-washi-400 opacity-0 transition-opacity hover:text-shu-400 group-hover:opacity-100 focus-visible:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  );
}
