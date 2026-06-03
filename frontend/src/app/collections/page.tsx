'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { useCollections, useCreateCollection, useDeleteCollection } from '@/lib/hooks';

export default function CollectionsPage() {
  const { data: collections, isLoading } = useCollections();
  const create = useCreateCollection();
  const del = useDeleteCollection();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-washi-50">Collections</h1>
          <p className="mt-1 text-sm text-washi-400">Themed shelves for your archive.</p>
        </div>
        <Button variant="secondary" onClick={() => setAdding((a) => !a)}>New collection</Button>
      </div>

      {adding && (
        <div className="mb-6 flex items-center gap-2">
          <input
            autoFocus
            className="h-10 flex-1 rounded-md border border-ink-line bg-ink-800 px-3 text-sm text-washi-50 placeholder:text-washi-600 focus:border-shu-500"
            placeholder="Collection name (e.g. Weekend Binge)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name) create.mutate(name, { onSuccess: () => { setName(''); setAdding(false); } });
            }}
          />
          <Button
            disabled={!name || create.isPending}
            onClick={() => create.mutate(name, { onSuccess: () => { setName(''); setAdding(false); } })}
          >
            Create
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-ink-800" />)}
        </div>
      ) : (collections?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <span className="font-jp text-4xl text-washi-600">収録</span>
          <p className="text-washi-200">No collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {collections!.map((c) => (
            <div key={c.id} className="group relative">
              {/* stacked-paper folio effect */}
              <span className="absolute -right-1 -top-1 h-full w-full rounded-lg border border-ink-line bg-ink-850" />
              <span className="absolute -right-0.5 -top-0.5 h-full w-full rounded-lg border border-ink-line bg-ink-800" />
              <div className="relative rounded-lg border border-ink-line bg-ink-800 p-5">
                <h3 className="font-display text-lg text-washi-50">{c.name}</h3>
                <p className="mt-1 font-mono text-xs text-washi-400">{c.items.length} title{c.items.length === 1 ? '' : 's'}</p>
                <div className="mt-4 flex -space-x-3">
                  {c.items.slice(0, 3).map((ci) => (
                    <Link key={ci.id} href={`/anime/${ci.libraryItem.animeId}`} className="block h-14 w-10 overflow-hidden rounded border border-ink-line bg-ink-750">
                      {ci.libraryItem.anime?.coverUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ci.libraryItem.anime.coverUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => del.mutate(c.id)}
                  aria-label={`Delete ${c.name}`}
                  className="absolute right-3 top-3 text-washi-400 opacity-0 transition-opacity hover:text-shu-400 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
