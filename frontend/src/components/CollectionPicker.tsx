'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import {
  useCollections,
  useAddToCollection,
  useRemoveFromCollection,
  useCreateCollection,
} from '@/lib/hooks';

export function CollectionPicker({ libraryItemId }: { libraryItemId: string }) {
  const { data: collections } = useCollections();
  const addTo = useAddToCollection();
  const removeFrom = useRemoveFromCollection();
  const create = useCreateCollection();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const isIn = (collectionId: string) =>
    (collections ?? [])
      .find((c) => c.id === collectionId)
      ?.items.some((ci) => ci.libraryItem.id === libraryItemId) ?? false;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Button variant="secondary" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" className="ic ic-sm"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
        Collections
      </Button>

      {open && (
        <div className="cpick">
          {(collections ?? []).length === 0 && (
            <p className="px-2.5 py-2 font-mono text-xs text-washi-400">No collections yet.</p>
          )}
          {(collections ?? []).map((c) => {
            const inside = isIn(c.id);
            return (
              <button
                key={c.id}
                className="cpick-row"
                onClick={() =>
                  inside
                    ? removeFrom.mutate({ collectionId: c.id, libraryItemId })
                    : addTo.mutate({ collectionId: c.id, libraryItemId })
                }
              >
                <span className="cpick-check">
                  {inside ? (
                    <svg viewBox="0 0 24 24" className="ic ic-sm"><path d="m6 12 4 4 8-9" /></svg>
                  ) : (
                    <span style={{ display: 'inline-block', width: 16 }} />
                  )}
                </span>
                {c.name}
              </button>
            );
          })}

          <div className="mt-1 flex items-center gap-1 border-t border-ink-line p-1.5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New collection"
              className="h-8 flex-1 rounded-sm border border-ink-line bg-ink-800 px-2 text-sm text-washi-50 placeholder:text-washi-600 focus:border-shu-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name) create.mutate(name, { onSuccess: () => setName('') });
              }}
            />
            <button
              className="cpick-row"
              style={{ width: 'auto', color: 'var(--accent)' }}
              disabled={!name}
              onClick={() => name && create.mutate(name, { onSuccess: () => setName('') })}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
