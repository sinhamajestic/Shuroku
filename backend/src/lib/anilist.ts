// AniList GraphQL client. Free, no key required.
// Used on search cache-miss and for hydrating anime detail.

const ANILIST_URL = 'https://graphql.anilist.co';

export interface AniListMedia {
  id: number;
  title: { romaji?: string | null; english?: string | null; native?: string | null };
  description?: string | null;
  coverImage?: { large?: string | null } | null;
  bannerImage?: string | null;
  seasonYear?: number | null;
  episodes?: number | null;
  format?: string | null;
  status?: string | null;
  genres?: string[] | null;
  popularity?: number | null;
  averageScore?: number | null;
}

/** Shape ready to upsert into the Anime table. */
export interface AnimeUpsertInput {
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

function stripHtml(s?: string | null): string | null {
  if (!s) return null;
  return s.replace(/<[^>]+>/g, '').trim() || null;
}

export function toUpsertInput(m: AniListMedia): AnimeUpsertInput {
  const title = m.title.english || m.title.romaji || m.title.native || 'Untitled';
  return {
    anilistId: m.id,
    title,
    titleRomaji: m.title.romaji ?? null,
    titleEng: m.title.english ?? null,
    titleNative: m.title.native ?? null,
    synopsis: stripHtml(m.description),
    coverUrl: m.coverImage?.large ?? null,
    bannerUrl: m.bannerImage ?? null,
    year: m.seasonYear ?? null,
    episodes: m.episodes ?? null,
    format: m.format ?? null,
    status: m.status ?? null,
    genres: m.genres ?? [],
    popularity: m.popularity ?? null,
    averageScore: m.averageScore ?? null,
  };
}

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { large }
  bannerImage
  seasonYear
  episodes
  format
  status
  genres
  popularity
  averageScore
`;

async function query<T>(gql: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: gql, variables }),
  });
  if (!res.ok) {
    throw new Error(`AniList error ${res.status}`);
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (!json.data) throw new Error('AniList returned no data');
  return json.data;
}

export async function searchAniList(term: string, limit = 12): Promise<AnimeUpsertInput[]> {
  const gql = `
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_FIELDS} }
      }
    }`;
  const data = await query<{ Page: { media: AniListMedia[] } }>(gql, {
    search: term,
    perPage: limit,
  });
  return data.Page.media.map(toUpsertInput);
}

export async function fetchAniListById(anilistId: number): Promise<AnimeUpsertInput | null> {
  const gql = `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} } }`;
  try {
    const data = await query<{ Media: AniListMedia | null }>(gql, { id: anilistId });
    return data.Media ? toUpsertInput(data.Media) : null;
  } catch {
    return null;
  }
}
