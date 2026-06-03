'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Anime, Collection, LibraryItem, Source, WatchStatus } from '@/types/api';

/* ---------------------------------- keys --------------------------------- */
export const qk = {
  library: (status?: WatchStatus) => ['library', status ?? 'all'] as const,
  anime: (id: string) => ['anime', id] as const,
  sources: (id: string) => ['sources', id] as const,
  collections: ['collections'] as const,
};

/* -------------------------------- library -------------------------------- */
export function useLibrary(status?: WatchStatus) {
  return useQuery({
    queryKey: qk.library(status),
    queryFn: () => api<{ items: LibraryItem[] }>(`/library${status ? `?status=${status}` : ''}`),
    select: (d) => d.items,
  });
}

export function useAddToLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (animeId: string) =>
      api<{ item: LibraryItem }>('/library', { method: 'POST', body: { animeId } }),
    meta: { toast: 'Added to library' },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['library'] }),
  });
}

export function useUpdateLibraryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Pick<LibraryItem, 'status' | 'progressEp' | 'season' | 'rating' | 'notes'>>) =>
      api<{ item: LibraryItem }>(`/library/${id}`, { method: 'PATCH', body: patch }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['library'] });
      qc.invalidateQueries({ queryKey: qk.anime(res.item.animeId) });
    },
  });
}

export function useIncrementEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<{ item: LibraryItem }>(`/library/${id}/increment`, { method: 'POST' }),
    meta: { toast: '+1 episode' },
    // Optimistic +1 across any cached library lists.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['library'] });
      const snapshots = qc.getQueriesData<{ items: LibraryItem[] }>({ queryKey: ['library'] });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        qc.setQueryData(key, {
          items: data.items.map((it) => (it.id === id ? { ...it, progressEp: it.progressEp + 1 } : it)),
        });
      }
      return { snapshots };
    },
    onError: (_e, _id, ctx) => ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: ['library'] }),
  });
}

export function useRemoveFromLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/library/${id}`, { method: 'DELETE' }),
    meta: { toast: 'Removed from library' },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['library'] }),
  });
}

/* --------------------------------- anime --------------------------------- */
export type AnimeWithSources = Anime & { sources: Source[] };

export function useAnime(id: string) {
  return useQuery({
    queryKey: qk.anime(id),
    queryFn: () => api<{ anime: AnimeWithSources }>(`/anime/${id}`),
    select: (d) => d.anime,
    enabled: Boolean(id),
  });
}

/* -------------------------------- sources -------------------------------- */
export function useAddSource(animeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { kind: 'PAID' | 'FREE'; label: string; url: string; embeddable?: boolean }) =>
      api<{ source: Source }>(`/anime/${animeId}/sources`, { method: 'POST', body }),
    meta: { toast: 'Source added' },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.anime(animeId) }),
  });
}

export function useDeleteSource(animeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => api<void>(`/sources/${sourceId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.anime(animeId) }),
  });
}

/* ------------------------------ collections ------------------------------ */
export function useCollections() {
  return useQuery({
    queryKey: qk.collections,
    queryFn: () => api<{ collections: Collection[] }>('/collections'),
    select: (d) => d.collections,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api<{ collection: Collection }>('/collections', { method: 'POST', body: { name } }),
    meta: { toast: 'Collection created' },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.collections }),
  });
}

export function useRenameCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api<{ collection: Collection }>(`/collections/${id}`, { method: 'PATCH', body: { name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.collections }),
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/collections/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.collections }),
  });
}

/* --------------------------------- search -------------------------------- */
import type { SearchResult } from '@/types/api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api<{ results: SearchResult[]; source: 'cache' | 'anilist' }>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 1,
    staleTime: 60_000,
  });
}

export function useAddToCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, libraryItemId }: { collectionId: string; libraryItemId: string }) =>
      api(`/collections/${collectionId}/items`, { method: 'POST', body: { libraryItemId } }),
    meta: { toast: 'Added to collection' },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.collections }),
  });
}

export function useRemoveFromCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, libraryItemId }: { collectionId: string; libraryItemId: string }) =>
      api<void>(`/collections/${collectionId}/items/${libraryItemId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.collections }),
  });
}

/* ------------------------------ export / import -------------------------- */
export interface ExportData {
  version: number;
  exportedAt: string;
  library: unknown[];
  collections: unknown[];
}

export async function fetchExport() {
  return api<ExportData>('/export');
}

export function useImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (library: unknown[]) => api<{ imported: number; skipped: number }>('/import', { method: 'POST', body: { library } }),
    meta: { toast: 'Library imported' },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['library'] }),
  });
}
