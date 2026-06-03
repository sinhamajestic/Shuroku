import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export default async function sourceRoutes(app: FastifyInstance) {
  // Public: anyone can view sources for an anime.
  app.get('/anime/:id/sources', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const anime = await prisma.anime.findUnique({ where: { id } });
    if (!anime) return reply.code(404).send({ error: 'Anime not found' });
    const sources = await prisma.source.findMany({
      where: { animeId: id },
      orderBy: [{ kind: 'asc' }, { createdAt: 'asc' }],
    });
    return { sources };
  });

  // Authed: add a source.
  app.post('/anime/:id/sources', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        kind: z.enum(['PAID', 'FREE']).default('FREE'),
        label: z.string().min(1).max(80),
        url: z.string().url(),
        embeddable: z.boolean().default(false),
      })
      .parse(req.body);

    const anime = await prisma.anime.findUnique({ where: { id } });
    if (!anime) return reply.code(404).send({ error: 'Anime not found' });

    const source = await prisma.source.create({
      data: { animeId: id, submittedBy: req.userId, ...body },
    });
    return reply.code(201).send({ source });
  });

  // Authed: delete a source you submitted.
  app.delete('/sources/:sourceId', { preHandler: app.requireAuth }, async (req, reply) => {
    const { sourceId } = z.object({ sourceId: z.string() }).parse(req.params);
    const { count } = await prisma.source.deleteMany({
      where: { id: sourceId, submittedBy: req.userId },
    });
    if (count === 0) return reply.code(404).send({ error: 'Source not found' });
    return reply.code(204).send();
  });
}
