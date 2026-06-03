import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { env, corsOrigins } from './env.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import animeRoutes from './routes/anime.js';
import libraryRoutes from './routes/library.js';
import collectionRoutes from './routes/collections.js';
import sourceRoutes from './routes/sources.js';
import exportRoutes from './routes/export.js';

export async function buildApp() {
  const app = Fastify({ logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' } });

  await app.register(cors, { origin: corsOrigins, credentials: true });
  await app.register(cookie);
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(authPlugin);

  // Consistent error envelope; surface Zod validation cleanly.
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: 'Validation failed', details: err.flatten() });
    }
    if (err.statusCode && err.statusCode < 500) {
      return reply.code(err.statusCode).send({ error: err.message });
    }
    app.log.error(err);
    return reply.code(500).send({ error: 'Internal server error' });
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(searchRoutes);
      await api.register(animeRoutes);
      await api.register(libraryRoutes);
      await api.register(collectionRoutes);
      await api.register(sourceRoutes);
      await api.register(exportRoutes);
    },
    { prefix: '/api/v1' },
  );

  return app;
}
