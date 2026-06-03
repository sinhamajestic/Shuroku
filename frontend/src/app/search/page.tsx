'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { PosterCard } from '@/components/ui/PosterCard';
import { useSearch, useLibrary, useAddToLibrary } from '@/lib/hooks';
import { useDebounced } from '@/lib/useDebounced';

function Results({ query }: { query: string }) {
  const { data, isLoading, isFetching } = useSearch(query);
  const { data: library } = useLibrary();
  const add = useAddToLibrary();
  const inLib = new Set((library ?? []).map((i) => i.animeId));

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <span className="font-jp text-4xl text-washi-600">収録</span>
        <p className="text-washi-400">Search the archive to begin.</p>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-md bg-ink-800" />)}
      </div>
    );
  }
  const results = data?.results ?? [];
  if (results.length === 0) return <p className="py-16 text-center text-washi-400">No match in the archive.</p>;

  return (
    <>
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-washi-400">
        {data?.source === 'anilist' ? 'fetched from AniList' : 'from your archive cache'}
        {isFetching && ' · updating…'}
      </p>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {results.map((r, i) => (
          <PosterCard
            key={r.id}
            animeId={r.id}
            title={r.title}
            coverUrl={r.coverUrl}
            year={r.year}
            saved={inLib.has(r.id)}
            index={i}
            onAdd={inLib.has(r.id) ? undefined : () => add.mutate(r.id)}
          />
        ))}
      </div>
    </>
  );
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q, 180);

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-washi-50">Search</h1>
      <p className="mt-1 text-sm text-washi-400">Find anything, add it with one tap. Press ⌘K anywhere for the quick palette.</p>

      <div className="mt-6 flex h-12 items-center gap-3 rounded-md border border-ink-line bg-ink-800 px-4 focus-within:border-shu-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-washi-400">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="search the archive…" aria-label="Search anime"
          className="h-full flex-1 bg-transparent font-mono text-sm text-washi-50 placeholder:text-washi-600 focus:outline-none"
        />
      </div>

      <div className="mt-8"><Results query={debounced} /></div>
    </AppShell>
  );
}
