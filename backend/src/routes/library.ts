import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const STATUS = z.enum(['WATCHING', 'COMPLETED', 'PLAN_TO_WATCH', 'PAUSED']);

export default async function libraryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.requireAuth);

  // GET /library?status=WATCHING
  app.get('/library', async (req) => {
    const { status } = z.object({ status: STATUS.optional() }).parse(req.query);
    const items = await prisma.libraryItem.findMany({
      where: { userId: req.userId, ...(status ? { status } : {}) },
      include: { anime: true },
      orderBy: { updatedAt: 'desc' },
    });
    return { items };
  });

  // POST /library  { animeId }  — idempotent on (userId, animeId)
  app.post('/library', async (req, reply) => {
    const { animeId, status } = z
      .object({ animeId: z.string(), status: STATUS.optional() })
      .parse(req.body);

    const anime = await prisma.anime.findUnique({ where: { id: animeId } });
    if (!anime) return reply.code(404).send({ error: 'Anime not found' });

    const item = await prisma.libraryItem.upsert({
      where: { userId_animeId: { userId: req.userId, animeId } },
      create: { userId: req.userId, animeId, status: status ?? 'PLAN_TO_WATCH' },
      update: status ? { status } : {},
      include: { anime: true },
    });
    return reply.code(201).send({ item });
  });

  // PATCH /library/:id  — update progress, status, rating, notes
  app.patch('/library/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        status: STATUS.optional(),
        progressEp: z.number().int().min(0).optional(),
        season: z.number().int().min(1).optional(),
        rating: z.number().int().min(1).max(10).nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(req.body);

    const owned = await prisma.libraryItem.findFirst({ where: { id, userId: req.userId } });
    if (!owned) return reply.code(404).send({ error: 'Library item not found' });

    const item = await prisma.libraryItem.update({
      where: { id },
      data: body,
      include: { anime: true },
    });
    return { item };
  });

  // POST /library/:id/increment  — quick "+1 episode"
  app.post('/library/:id/increment', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const owned = await prisma.libraryItem.findFirst({ where: { id, userId: req.userId } });
    if (!owned) return reply.code(404).send({ error: 'Library item not found' });

    const item = await prisma.libraryItem.update({
      where: { id },
      data: { progressEp: { increment: 1 } },
      include: { anime: true },
    });
    return { item };
  });

  app.delete('/library/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { count } = await prisma.libraryItem.deleteMany({ where: { id, userId: req.userId } });
    if (count === 0) return reply.code(404).send({ error: 'Library item not found' });
    return reply.code(204).send();
  });
}
