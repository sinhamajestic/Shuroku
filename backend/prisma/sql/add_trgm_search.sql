-- Trigram search support for Postgres typeahead.
-- Prisma cannot express GIN(gin_trgm_ops) indexes, so apply this after the init migration:
--   npx prisma migrate dev --create-only --name add_trgm_search
-- then paste these lines into the generated migration.sql and run:
--   npx prisma migrate dev

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS anime_title_trgm
  ON "Anime" USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS anime_romaji_trgm
  ON "Anime" USING GIN ("titleRomaji" gin_trgm_ops);
