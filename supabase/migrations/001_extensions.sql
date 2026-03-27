-- Division Alpha: Required Extensions
-- Run first before all other migrations

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";          -- pgvector for semantic agent memory
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- fuzzy text search
-- Note: pg_cron must be enabled via Supabase Dashboard > Database > Extensions
