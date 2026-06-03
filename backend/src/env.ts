import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  // Comma-separated list of allowed origins (e.g. "http://localhost:3000,https://shuroku.app")
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  // Cross-site deploys (frontend and API on different domains) need 'none' + secure.
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);

// Helpers derived from env.
export const corsOrigins = env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
// SameSite=None is only valid alongside Secure; force Secure when cross-site.
export const cookieSecure = env.COOKIE_SAMESITE === 'none' || env.NODE_ENV === 'production';
