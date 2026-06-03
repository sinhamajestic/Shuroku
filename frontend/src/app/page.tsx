'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { PosterCard } from '@/components/ui/PosterCard';
import { Poster } from '@/components/ui/Poster';
import { EpisodeStepper } from '@/components/ui/EpisodeStepper';
import { useLibrary, useIncrementEpisode, useUpdateLibraryItem } from '@/lib/hooks';
import { STATUS_META, type LibraryItem, type WatchStatus } from '@/types/api';

const ORDER: WatchStatus[] = ['WATCHING', 'COMPLETED', 'PLAN_TO_WATCH', 'PAUSED'];

function ContinueWatching({ items }: { items: LibraryItem[] }) {
  const router = useRouter();
  const inc = useIncrementEpisode();
  const update = useUpdateLibraryItem();
  if (items.length === 0) return null;
  return (
    <section className="mb-2">
      <h2 className="mb-3 font-display text-xl text-washi-50">Continue Watching <span className="font-mono text-sm text-washi-400">{items.length}</span></h2>
      <div className="cw-rail">
        {items.map((item) => (
          <div key={item.id} className="cw-card" onClick={() => router.push(`/anime/${item.anime.id}`)}>
            <div className="cw-thumb"><Poster title={item.anime.title} coverUrl={item.anime.coverUrl} /></div>
            <div className="cw-body">
              <div className="cw-title">{item.anime.title}</div>
              <div className="cw-meta" onClick={(e) => e.stopPropagation()}>
                <EpisodeStepper
                  progress={item.progressEp}
                  total={item.anime.episodes}
                  busy={inc.isPending || update.isPending}
                  onInc={() => inc.mutate(item.id)}
                  onDec={() => update.mutate({ id: item.id, progressEp: Math.max(0, item.progressEp - 1) })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListRow({ item }: { item: LibraryItem }) {
  const router = useRouter();
  const inc = useIncrementEpisode();
  const meta = STATUS_META[item.status];
  const pct = item.anime.episodes ? Math.min(100, (item.progressEp / item.anime.episodes) * 100) : 0;
  return (
    <div className="list-row" onClick={() => router.push(`/anime/${item.anime.id}`)}>
      <div className="list-thumb"><Poster title={item.anime.title} coverUrl={item.anime.coverUrl} /></div>
      <div className="list-main">
        <div className="list-title">{item.anime.title}</div>
        <div className="list-sub">{[STATUS_META[item.status].label, item.anime.year, item.anime.format].filter(Boolean).join(' · ')}</div>
      </div>
      <div className="list-right">
        {item.anime.episodes ? (
          <>
            <span className="list-prog-num">{item.progressEp} / {item.anime.episodes}</span>
            <span className="list-prog-track"><span style={{ display: 'block', height: '100%', width: `${pct}%`, background: meta.hue }} /></span>
            {item.progressEp < item.anime.episodes && (
              <button className="list-ep-btn" onClick={(e) => { e.stopPropagation(); inc.mutate(item.id); }}>
                <svg viewBox="0 0 24 24" className="ic"><path d="M12 5v14M5 12h14" /></svg> +1
              </button>
            )}
          </>
        ) : (
          <span className="list-prog-num">—</span>
        )}
      </div>
    </div>
  );
}

function LibraryView() {
  const params = useSearchParams();
  const raw = params.get('status');
  const filter = raw && ORDER.includes(raw as WatchStatus) ? (raw as WatchStatus) : 'ALL';
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { data: items, isLoading, isError } = useLibrary();
  const inc = useIncrementEpisode();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-md bg-ink-800" />)}
      </div>
    );
  }
  if (isError) return <p className="text-sm text-shu-400">Could not load your archive. Is the API running?</p>;

  const all = items ?? [];
  const counts = ORDER.reduce<Record<string, number>>((acc, k) => ((acc[k] = all.filter((i) => i.status === k).length), acc), {});
  const watching = all.filter((i) => i.status === 'WATCHING').sort((a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt));
  const shown = filter === 'ALL' ? all : all.filter((i) => i.status === filter);

  return (
    <>
      <div className="mb-2">
        <h1 className="font-display text-3xl text-washi-50">{filter === 'ALL' ? 'Your Archive' : STATUS_META[filter].label}</h1>
        <p className="mt-1 font-mono text-sm text-washi-400">{all.length} entr{all.length === 1 ? 'y' : 'ies'} · sorted by recently updated</p>
      </div>

      {filter === 'ALL' && watching.length > 0 && <ContinueWatching items={watching} />}

      <div className="flex items-center justify-between">
        <div className="filter-strip">
          <Link href="/" className={`filter-chip ${filter === 'ALL' ? 'on' : ''}`}>All <span className="n">{all.length}</span></Link>
          {ORDER.map((k) => (
            <Link key={k} href={`/?status=${k}`} className={`filter-chip ${filter === k ? 'on' : ''}`}>
              {STATUS_META[k].label} <span className="n">{counts[k]}</span>
            </Link>
          ))}
        </div>
        <div className="seg">
          <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}>
            <svg viewBox="0 0 24 24" className="ic ic-sm"><rect x="3" y="3" width="7" height="7" rx="1.2" /><rect x="14" y="3" width="7" height="7" rx="1.2" /><rect x="3" y="14" width="7" height="7" rx="1.2" /><rect x="14" y="14" width="7" height="7" rx="1.2" /></svg>
          </button>
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}>
            <svg viewBox="0 0 24 24" className="ic ic-sm"><rect x="3" y="5" width="4" height="4" rx="1" /><path d="M10 7h11" /><rect x="3" y="15" width="4" height="4" rx="1" /><path d="M10 17h11" /></svg>
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <span className="font-jp text-5xl text-washi-600">収録</span>
          <p className="text-washi-200">{filter === 'ALL' ? 'Your archive is empty.' : 'Nothing filed here yet.'}</p>
          <Link href="/search"><Button>Search anime</Button></Link>
        </div>
      ) : view === 'list' ? (
        <div className="list">{shown.map((item) => <ListRow key={item.id} item={item} />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((item, i) => (
            <PosterCard
              key={item.id}
              animeId={item.anime.id}
              title={item.anime.title}
              coverUrl={item.anime.coverUrl}
              year={item.anime.year}
              episodes={item.anime.episodes}
              format={item.anime.format}
              status={item.status}
              progressEp={item.progressEp}
              index={i}
              onIncrement={() => inc.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-ink-800" />}>
        <LibraryView />
      </Suspense>
    </AppShell>
  );
}
