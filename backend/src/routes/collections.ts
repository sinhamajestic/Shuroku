import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export default async function collectionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.requireAuth);

  app.get('/collections', async (req) => {
    const collections = await prisma.collection.findMany({
      where: { userId: req.userId },
      orderBy: { order: 'asc' },
      include: { items: { include: { libraryItem: { include: { anime: true } } }, orderBy: { order: 'asc' } } },
    });
    return { collections };
  });

  app.post('/collections', async (req, reply) => {
    const { name } = z.object({ name: z.string().min(1).max(80) }).parse(req.body);
    const count = await prisma.collection.count({ where: { userId: req.userId } });
    const collection = await prisma.collection.create({
      data: { userId: req.userId, name, order: count },
    });
    return reply.code(201).send({ collection });
  });

  app.patch('/collections/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({ name: z.string().min(1).max(80).optional(), order: z.number().int().min(0).optional() })
      .parse(req.body);
    const owned = await prisma.collection.findFirst({ where: { id, userId: req.userId } });
    if (!owned) return reply.code(404).send({ error: 'Collection not found' });
    const collection = await prisma.collection.update({ where: { id }, data: body });
    return { collection };
  });

  app.delete('/collections/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { count } = await prisma.collection.deleteMany({ where: { id, userId: req.userId } });
    if (count === 0) return reply.code(404).send({ error: 'Collection not found' });
    return reply.code(204).send();
  });

  // Add a library item to a collection (both must belong to the user).
  app.post('/collections/:id/items', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { libraryItemId } = z.object({ libraryItemId: z.string() }).parse(req.body);

    const [collection, libItem] = await Promise.all([
      prisma.collection.findFirst({ where: { id, userId: req.userId } }),
      prisma.libraryItem.findFirst({ where: { id: libraryItemId, userId: req.userId } }),
    ]);
    if (!collection || !libItem) return reply.code(404).send({ error: 'Collection or item not found' });

    const order = await prisma.collectionItem.count({ where: { collectionId: id } });
    const item = await prisma.collectionItem.upsert({
      where: { collectionId_libraryItemId: { collectionId: id, libraryItemId } },
      create: { collectionId: id, libraryItemId, order },
      update: {},
    });
    return reply.code(201).send({ item });
  });

  app.delete('/collections/:id/items/:itemId', async (req, reply) => {
    const { id, itemId } = z.object({ id: z.string(), itemId: z.string() }).parse(req.params);
    const owned = await prisma.collection.findFirst({ where: { id, userId: req.userId } });
    if (!owned) return reply.code(404).send({ error: 'Collection not found' });
    await prisma.collectionItem.deleteMany({ where: { collectionId: id, libraryItemId: itemId } });
    return reply.code(204).send();
  });
}
