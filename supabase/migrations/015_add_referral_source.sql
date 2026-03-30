-- Add referral_source column to track how applicants found Division Alpha
-- Used for attribution tracking across marketing channels (warm DMs, Discord, LinkedIn, etc.)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS referral_source text;
