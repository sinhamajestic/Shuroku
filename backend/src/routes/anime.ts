import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { fetchAniListById } from '../lib/anilist.js';

export default async function animeRoutes(app: FastifyInstance) {
  // Public detail page. Refreshes from AniList if cache is stale (>12h).
  app.get('/anime/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);

    let anime = await prisma.anime.findUnique({
      where: { id },
      include: { sources: { orderBy: { createdAt: 'asc' } } },
    });
    if (!anime) return reply.code(404).send({ error: 'Anime not found' });

    const stale = Date.now() - anime.fetchedAt.getTime() > 12 * 60 * 60 * 1000;
    if (stale) {
      const fresh = await fetchAniListById(anime.anilistId);
      if (fresh) {
        await prisma.anime.update({
          where: { id },
          data: { ...fresh, fetchedAt: new Date() },
        });
        anime = await prisma.anime.findUnique({
          where: { id },
          include: { sources: { orderBy: { createdAt: 'asc' } } },
        });
      }
    }
    return { anime };
  });
}
