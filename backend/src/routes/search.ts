import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { searchAniList } from '../lib/anilist.js';

interface SearchRow {
  id: string;
  anilistId: number;
  title: string;
  titleRomaji: string | null;
  coverUrl: string | null;
  year: number | null;
}

export default async function searchRoutes(app: FastifyInstance) {
  // Public typeahead. Trigram match over cached Anime; AniList fallback on thin results.
  app.get('/search', async (req) => {
    const { q } = z.object({ q: z.string().min(1).max(100) }).parse(req.query);

    const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT id, "anilistId", title, "titleRomaji", "coverUrl", year
      FROM "Anime"
      WHERE title % ${q} OR "titleRomaji" % ${q}
      ORDER BY GREATEST(similarity(title, ${q}), similarity(COALESCE("titleRomaji", ''), ${q})) DESC,
               popularity DESC NULLS LAST
      LIMIT 12
    `);

    if (rows.length >= 5) return { results: rows, source: 'cache' };

    // Cache miss / thin: hydrate from AniList, upsert, then return merged.
    try {
      const remote = await searchAniList(q, 12);
      await prisma.$transaction(
        remote.map((a) =>
          prisma.anime.upsert({
            where: { anilistId: a.anilistId },
            create: a,
            update: { ...a, fetchedAt: new Date() },
          }),
        ),
      );
      const merged = await prisma.anime.findMany({
        where: { anilistId: { in: remote.map((r) => r.anilistId) } },
        select: { id: true, anilistId: true, title: true, titleRomaji: true, coverUrl: true, year: true },
        orderBy: { popularity: 'desc' },
        take: 12,
      });
      return { results: merged, source: 'anilist' };
    } catch {
      // AniList down: return whatever cache had.
      return { results: rows, source: 'cache' };
    }
  });
}
