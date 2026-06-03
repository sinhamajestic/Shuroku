import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomBytes, createHash } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { prisma } from '../lib/prisma.js';
import { env, cookieSecure } from '../env.js';

const REFRESH_COOKIE = 'shuroku_rt';
// Must match where the auth routes actually live (app registers them under /api/v1).
const COOKIE_PATH = '/api/v1/auth';
// Tighter limit on credential endpoints to resist brute force.
const AUTH_RATE = { rateLimit: { max: 10, timeWindow: '1 minute' } };

function newRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(48).toString('base64url');
  return { token, hash: createHash('sha256').update(token).digest('hex') };
}

function refreshExpiry(): Date {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export default async function authRoutes(app: FastifyInstance) {
  const credentials = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(200),
    name: z.string().min(1).max(80).optional(),
  });

  async function issueSession(userId: string, userAgent: string | undefined, reply: FastifyReply) {
    const { token, hash: rtHash } = newRefreshToken();
    await prisma.session.create({
      data: { userId, refreshTokenHash: rtHash, userAgent, expiresAt: refreshExpiry() },
    });
    const accessToken = app.jwt.sign({ sub: userId });
    reply.setCookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      sameSite: env.COOKIE_SAMESITE,
      secure: cookieSecure,
      path: COOKIE_PATH,
      maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    });
    return accessToken;
  }

  app.post('/auth/register', { config: AUTH_RATE }, async (req, reply) => {
    const body = credentials.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return reply.code(409).send({ error: 'Email already registered' });

    const user = await prisma.user.create({
      data: { email: body.email, passwordHash: await hash(body.password), name: body.name },
    });
    const accessToken = await issueSession(user.id, req.headers['user-agent'], reply);
    return reply.code(201).send({ accessToken, user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post('/auth/login', { config: AUTH_RATE }, async (req, reply) => {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verify(user.passwordHash, body.password))) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    const accessToken = await issueSession(user.id, req.headers['user-agent'], reply);
    return { accessToken, user: { id: user.id, email: user.email, name: user.name } };
  });

  // Rotate: validate cookie token, delete old session, issue a fresh one.
  app.post('/auth/refresh', async (req, reply) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return reply.code(401).send({ error: 'No refresh token' });
    const rtHash = createHash('sha256').update(token).digest('hex');
    const session = await prisma.session.findUnique({ where: { refreshTokenHash: rtHash } });
    if (!session || session.expiresAt < new Date()) {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }
    await prisma.session.delete({ where: { id: session.id } });
    const accessToken = await issueSession(session.userId, req.headers['user-agent'], reply);
    return { accessToken };
  });

  app.post('/auth/logout', async (req, reply) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      const rtHash = createHash('sha256').update(token).digest('hex');
      await prisma.session.deleteMany({ where: { refreshTokenHash: rtHash } });
    }
    reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return { ok: true };
  });

  app.get('/auth/me', { preHandler: app.requireAuth }, async (req) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return { user };
  });
}
