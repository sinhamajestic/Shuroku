'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { EpisodeStepper } from '@/components/ui/EpisodeStepper';
import { SourceChip } from '@/components/ui/SourceChip';
import { Poster } from '@/components/ui/Poster';
import { CollectionPicker } from '@/components/CollectionPicker';
import {
  useAnime,
  useLibrary,
  useAddToLibrary,
  useUpdateLibraryItem,
  useIncrementEpisode,
  useAddSource,
  useDeleteSource,
} from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import type { WatchStatus } from '@/types/api';

function Stars({ value, onSet }: { value: number | null; onSet: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rating out of 10">
      {Array.from({ length: 10 }).map((_, i) => {
        const n = i + 1;
        const filled = value != null && n <= value;
        return (
          <button
            key={n}
            onClick={() => onSet(n)}
            aria-label={`${n} of 10`}
            className="text-lg leading-none transition-transform hover:scale-110"
            style={{ color: filled ? '#C9A227' : '#4A4035' }}
          >
            ★
          </button>
        );
      })}
      {value != null && <span className="ml-2 font-mono text-sm text-washi-400">{value}/10</span>}
    </div>
  );
}

function AddSourceForm({ animeId }: { animeId: string }) {
  const add = useAddSource(animeId);
  const [kind, setKind] = useState<'PAID' | 'FREE'>('FREE');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const field = 'h-9 rounded-md border border-ink-line bg-ink-800 px-3 text-sm text-washi-50 placeholder:text-washi-600 focus:border-shu-500';

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <select className={field} value={kind} onChange={(e) => setKind(e.target.value as 'PAID' | 'FREE')}>
        <option value="FREE">Free</option>
        <option value="PAID">Official</option>
      </select>
      <input className={`${field} w-32`} placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <input className={`${field} flex-1 min-w-[200px]`} placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Button
        variant="secondary"
        disabled={!label || !url || add.isPending}
        onClick={() => {
          add.mutate({ kind, label, url }, { onSuccess: () => { setLabel(''); setUrl(''); } });
        }}
      >
        Add source
      </Button>
    </div>
  );
}

export default function AnimeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const { data: anime, isLoading, isError } = useAnime(id);
  const { data: library } = useLibrary();
  const item = library?.find((i) => i.animeId === id) ?? null;

  const add = useAddToLibrary();
  const update = useUpdateLibraryItem();
  const inc = useIncrementEpisode();
  const delSource = useDeleteSource(id);

  if (isLoading) {
    return (
      <AppShell>
        <div className="h-60 animate-pulse rounded-lg bg-ink-800" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-ink-800" />
      </AppShell>
    );
  }
  if (isError || !anime) {
    return (
      <AppShell>
        <p className="text-washi-200">This entry could not be found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/')}>← Back to library</Button>
      </AppShell>
    );
  }

  const sources = anime.sources ?? [];
  const paid = sources.filter((s) => s.kind === 'PAID');
  const free = sources.filter((s) => s.kind === 'FREE');

  return (
    <AppShell>
      {/* Banner */}
      <div className="relative -mx-6 -mt-12 h-56 overflow-hidden">
        {anime.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={anime.bannerUrl} alt="" aria-hidden className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-ink-850" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg) 8%, transparent)' }} />
        <button
          onClick={() => router.back()}
          className="absolute left-6 top-6 rounded-md border border-ink-line bg-ink-900/60 px-3 py-1.5 text-sm text-washi-200 backdrop-blur hover:text-washi-50"
        >
          ← Back
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Left: poster + actions */}
        <div className="space-y-4 md:-mt-20">
          <div className="aspect-[2/3] overflow-hidden rounded-md border border-ink-line bg-ink-800 shadow-e2 max-w-[220px] md:max-w-none">
            <Poster title={anime.title} coverUrl={anime.coverUrl} />
          </div>

          {item ? (
            <div className="space-y-4 rounded-md border border-ink-line bg-ink-850 p-4">
              <StatusPill value={item.status} onChange={(s: WatchStatus) => update.mutate({ id: item.id, status: s })} />
              <EpisodeStepper
                progress={item.progressEp}
                total={anime.episodes}
                busy={inc.isPending || update.isPending}
                onInc={() => inc.mutate(item.id)}
                onDec={() => update.mutate({ id: item.id, progressEp: Math.max(0, item.progressEp - 1) })}
              />
              <div>
                <p className="mb-1 font-mono text-xs uppercase tracking-widest text-washi-400">Your rating</p>
                <Stars value={item.rating} onSet={(n) => update.mutate({ id: item.id, rating: n })} />
              </div>
              <CollectionPicker libraryItemId={item.id} />
              <div>
                <p className="mb-1 font-mono text-xs uppercase tracking-widest text-washi-400">Notes</p>
                <textarea
                  defaultValue={item.notes ?? ''}
                  placeholder="A margin note…"
                  rows={3}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (item.notes ?? '')) update.mutate({ id: item.id, notes: v || null });
                  }}
                  className="w-full resize-none rounded-md border border-ink-line bg-ink-800 px-3 py-2 text-sm text-washi-50 placeholder:text-washi-600 focus:border-shu-500"
                />
              </div>
            </div>
          ) : (
            <Button className="w-full" disabled={add.isPending} onClick={() => add.mutate(anime.id)}>
              {add.isPending ? 'Adding…' : 'Add to library'}
            </Button>
          )}
        </div>

        {/* Right: metadata + synopsis + sources */}
        <div className="pt-2">
          <h1 className="font-display text-3xl text-washi-50">{anime.title}</h1>
          {anime.titleRomaji && anime.titleRomaji !== anime.title && (
            <p className="mt-1 text-washi-400">{anime.titleRomaji}</p>
          )}
          <p className="mt-3 font-mono text-sm text-washi-400">
            {[anime.year, anime.format, anime.episodes && `${anime.episodes} eps`, anime.averageScore && `★ ${anime.averageScore}`]
              .filter(Boolean)
              .join('  ·  ')}
          </p>

          {anime.genres?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <span key={g} className="rounded-full border border-ink-line px-3 py-1 text-xs text-washi-200">
                  {g}
                </span>
              ))}
            </div>
          )}

          {anime.synopsis && (
            <p className="mt-6 max-w-[68ch] leading-relaxed text-washi-200">{anime.synopsis}</p>
          )}

          <section className="mt-8">
            <h2 className="font-display text-xl text-washi-50">Watch official</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {paid.length ? (
                paid.map((s) => <SourceChip key={s.id} source={s} />)
              ) : (
                <p className="text-sm text-washi-400">No official sources listed yet.</p>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-xl text-washi-50">Other sources</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {free.map((s) => (
                <SourceChip
                  key={s.id}
                  source={s}
                  onDelete={s.submittedBy === user?.id ? () => delSource.mutate(s.id) : undefined}
                />
              ))}
            </div>
            <AddSourceForm animeId={anime.id} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
