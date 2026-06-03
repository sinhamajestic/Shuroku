import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export default async function exportRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.requireAuth);

  // GET /export — full library + collections as JSON (keyed by anilistId for portability).
  app.get('/export', async (req) => {
    const [items, collections] = await Promise.all([
      prisma.libraryItem.findMany({ where: { userId: req.userId }, include: { anime: true } }),
      prisma.collection.findMany({
        where: { userId: req.userId },
        include: { items: { include: { libraryItem: true } } },
      }),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      library: items.map((i) => ({
        anilistId: i.anime.anilistId,
        title: i.anime.title,
        status: i.status,
        progressEp: i.progressEp,
        season: i.season,
        rating: i.rating,
        notes: i.notes,
      })),
      collections: collections.map((c) => ({
        name: c.name,
        animeAnilistIds: c.items.map((ci) => ci.libraryItem.animeId),
      })),
    };
  });

  // POST /import — restore library entries by anilistId (anime must already be cached or fetched).
  app.post('/import', async (req, reply) => {
    const body = z
      .object({
        library: z.array(
          z.object({
            anilistId: z.number().int(),
            status: z.enum(['WATCHING', 'COMPLETED', 'PLAN_TO_WATCH', 'PAUSED']),
            progressEp: z.number().int().min(0).default(0),
            season: z.number().int().min(1).default(1),
            rating: z.number().int().min(1).max(10).nullable().optional(),
            notes: z.string().max(2000).nullable().optional(),
          }),
        ),
      })
      .parse(req.body);

    let imported = 0;
    let skipped = 0;
    for (const entry of body.library) {
      const anime = await prisma.anime.findUnique({ where: { anilistId: entry.anilistId } });
      if (!anime) {
        skipped++; // not yet cached; client should search it first to hydrate
        continue;
      }
      await prisma.libraryItem.upsert({
        where: { userId_animeId: { userId: req.userId, animeId: anime.id } },
        create: {
          userId: req.userId,
          animeId: anime.id,
          status: entry.status,
          progressEp: entry.progressEp,
          season: entry.season,
          rating: entry.rating ?? null,
          notes: entry.notes ?? null,
        },
        update: {
          status: entry.status,
          progressEp: entry.progressEp,
          season: entry.season,
          rating: entry.rating ?? null,
          notes: entry.notes ?? null,
        },
      });
      imported++;
    }
    return reply.send({ imported, skipped });
  });
}
