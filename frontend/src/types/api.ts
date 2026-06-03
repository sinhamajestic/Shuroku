// Mirrors the Shuroku backend (/api/v1) response shapes.

export type WatchStatus = 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'PAUSED';
export type SourceKind = 'PAID' | 'FREE';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
}

export interface Anime {
  id: string;
  anilistId: number;
  title: string;
  titleRomaji: string | null;
  titleEng: string | null;
  titleNative: string | null;
  synopsis: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  year: number | null;
  episodes: number | null;
  format: string | null;
  status: string | null;
  genres: string[];
  popularity: number | null;
  averageScore: number | null;
}

export interface SearchResult {
  id: string;
  anilistId: number;
  title: string;
  titleRomaji: string | null;
  coverUrl: string | null;
  year: number | null;
}

export interface LibraryItem {
  id: string;
  userId: string;
  animeId: string;
  status: WatchStatus;
  progressEp: number;
  season: number;
  rating: number | null;
  notes: string | null;
  addedAt: string;
  updatedAt: string;
  anime: Anime;
}

export interface Source {
  id: string;
  animeId: string;
  kind: SourceKind;
  label: string;
  url: string;
  embeddable: boolean;
  submittedBy: string | null;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  order: number;
  items: { id: string; order: number; libraryItem: LibraryItem }[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const STATUS_META: Record<WatchStatus, { label: string; hue: string }> = {
  WATCHING: { label: 'Watching', hue: 'var(--ai-500, #4A6FA5)' },
  COMPLETED: { label: 'Completed', hue: '#7E9B5A' },
  PLAN_TO_WATCH: { label: 'Plan to Watch', hue: '#A8987F' },
  PAUSED: { label: 'Paused', hue: '#8A7F73' },
};
