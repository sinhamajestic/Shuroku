CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS anime_title_trgm  ON "Anime" USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS anime_romaji_trgm ON "Anime" USING GIN ("titleRomaji" gin_trgm_ops);