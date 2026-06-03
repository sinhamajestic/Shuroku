# Shuroku Backend

Fastify + TypeScript + Prisma + PostgreSQL API for a personal anime library and watch-progress tracker. Multi-user with auth, Postgres trigram search, AniList metadata.

## Stack

- **Fastify** (TypeScript, ESM) with Zod-validated routes
- **Prisma** + **PostgreSQL** (Neon/Supabase free tier or local Docker)
- **Auth:** email/password (argon2) + JWT access tokens + rotating refresh tokens
- **Search:** Postgres `pg_trgm` (no external search service)
- **Metadata:** AniList GraphQL (free, no key)

## Setup

```bash
npm install
cp .env.example .env          # fill DATABASE_URL + JWT_SECRET

npx prisma migrate dev --name init
```

### Enable trigram search (one time)

Prisma can't express GIN trigram indexes, so add them in an empty migration:

```bash
npx prisma migrate dev --create-only --name add_trgm_search
```

Edit the generated `.sql` and add:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX anime_title_trgm  ON "Anime" USING GIN (title gin_trgm_ops);
CREATE INDEX anime_romaji_trgm ON "Anime" USING GIN ("titleRomaji" gin_trgm_ops);
```

Then apply and seed:

```bash
npx prisma migrate dev
npm run seed                  # creates me@shuroku.local / changeme123
npm run dev                   # http://localhost:4000
```

## API (prefix `/api/v1`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | – | create account, returns access token + sets refresh cookie |
| POST | `/auth/login` | – | log in |
| POST | `/auth/refresh` | cookie | rotate refresh token, new access token |
| POST | `/auth/logout` | – | revoke session |
| GET | `/auth/me` | ✓ | current user |
| GET | `/search?q=` | – | typeahead (trigram + AniList fallback) |
| GET | `/anime/:id` | – | detail + sources (auto-refreshes if stale) |
| GET | `/library?status=` | ✓ | your library |
| POST | `/library` | ✓ | add anime (idempotent) |
| PATCH | `/library/:id` | ✓ | update status/progress/rating/notes |
| POST | `/library/:id/increment` | ✓ | +1 episode |
| DELETE | `/library/:id` | ✓ | remove |
| GET/POST | `/collections` | ✓ | list / create |
| PATCH/DELETE | `/collections/:id` | ✓ | rename-reorder / delete |
| POST | `/collections/:id/items` | ✓ | add library item to collection |
| DELETE | `/collections/:id/items/:itemId` | ✓ | remove from collection |
| GET/POST | `/anime/:id/sources` | view: – / add: ✓ | sources |
| DELETE | `/sources/:sourceId` | ✓ | delete own source |
| GET | `/export` | ✓ | full library as JSON |
| POST | `/import` | ✓ | restore from JSON |

### Auth flow

Access token in `Authorization: Bearer <token>` (15 min). Refresh token in an httpOnly cookie scoped to `/auth`; `POST /auth/refresh` rotates it (old session deleted, new one issued) for revocation support.

## Notes

- Search returns cached results instantly; on a thin cache it hydrates from AniList, upserts, and returns. Indexing is synchronous here for simplicity — move it to a job queue (Upstash QStash) if AniList latency shows up under real use.
- Cover images hotlink the AniList CDN, so no image host needed.
