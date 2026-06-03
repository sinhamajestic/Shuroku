'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poster } from './ui/Poster';
import { SealButton } from './ui/SealButton';
import { useSearch, useLibrary, useAddToLibrary } from '@/lib/hooks';
import { useDebounced } from '@/lib/useDebounced';

export function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounced(q, 180);

  const { data, isFetching } = useSearch(debounced);
  const { data: library } = useLibrary();
  const add = useAddToLibrary();
  const inLib = new Set((library ?? []).map((i) => i.animeId));
  const results = data?.results ?? [];

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => setSel(0), [debounced]);

  const openItem = (id: string) => {
    onClose();
    router.push(`/anime/${id}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        const r = results[sel];
        if (!r) return;
        if (e.metaKey || e.ctrlKey) {
          if (!inLib.has(r.id)) add.mutate(r.id);
        } else {
          openItem(r.id);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [results, sel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="palette-overlay" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-label="Search" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-input-row">
          <svg viewBox="0 0 24 24" className="ic" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="search the archive…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search anime"
          />
          {q && <span className="src-tag">{isFetching ? 'fetching…' : `${results.length} results`}</span>}
        </div>

        <div className="palette-results">
          {isFetching && results.length === 0 ? (
            [0, 1, 2].map((i) => <div key={i} className="ghost-row" />)
          ) : !q.trim() ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 'var(--t-sm)' }}>
              Search the archive to begin.
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 'var(--t-sm)' }}>
              No match in the archive.
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={r.id}
                className={`presult ${i === sel ? 'sel' : ''}`}
                onMouseEnter={() => setSel(i)}
                onClick={() => openItem(r.id)}
              >
                <div className="presult-thumb">
                  <Poster title={r.title} coverUrl={r.coverUrl} />
                </div>
                <div className="presult-body">
                  <div className="presult-title">{r.title}</div>
                  <div className="presult-meta">
                    {[r.titleRomaji, r.year].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {inLib.has(r.id) ? (
                  <span className="src-tag">in archive</span>
                ) : data?.source === 'anilist' ? (
                  <SealButton saved={false} onAdd={() => add.mutate(r.id)} />
                ) : (
                  <SealButton saved={false} onAdd={() => add.mutate(r.id)} />
                )}
              </div>
            ))
          )}
        </div>

        <div className="palette-foot">
          <span><span className="k">↑↓</span>navigate</span>
          <span><span className="k">↵</span>open</span>
          <span><span className="k">⌘↵</span>quick-add</span>
          <span style={{ marginLeft: 'auto' }}><span className="k">esc</span>close</span>
        </div>
      </div>
    </div>
  );
}
