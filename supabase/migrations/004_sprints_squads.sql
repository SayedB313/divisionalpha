-- Division Alpha: Sprints, Squads, and Squad Members

-- SPRINTS
CREATE TABLE public.sprints (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number            INT NOT NULL,                      -- Sprint 1, 2, 3...
  tier              INT NOT NULL DEFAULT 2 CHECK (tier IN (2, 3)),
  name              TEXT,                              -- "Sprint 4"

  -- Dates
  week0_start       DATE NOT NULL,                     -- Handshake week begins
  start_date        DATE NOT NULL,                     -- Week 1 Monday
  end_date          DATE NOT NULL,                     -- Final Friday
  current_week      INT DEFAULT 0,                     -- 0=pre-sprint, 1-6 (or 1-12)
  duration_weeks    INT NOT NULL DEFAULT 6,            -- 6 for Tier 2, 12 for Tier 3

  -- Status
  status            TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','handshake','active','dip_week','completing','completed')),

  -- Capacity
  max_squads        INT DEFAULT 20,
  spots_remaining   INT DEFAULT 80,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- Add FK from applications to sprints
ALTER TABLE public.applications
  ADD CONSTRAINT fk_applications_sprint
  FOREIGN KEY (target_sprint_id) REFERENCES sprints(id);

-- SQUADS
CREATE TABLE public.squads (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id             UUID NOT NULL REFERENCES sprints(id),
  name                  TEXT NOT NULL,                  -- "Alpha Vanguard"
  tier                  INT NOT NULL DEFAULT 2,
  captain_id            UUID REFERENCES profiles(id),

  -- Denormalized metrics (updated by Analytics agent)
  member_count          INT DEFAULT 0,
  health_score          DECIMAL(5,2),                   -- 0-100
  completion_rate       DECIMAL(5,2),                   -- 0-100
  continuation_probability DECIMAL(5,2),
  streak                INT DEFAULT 0,                  -- consecutive sprints together

  -- Matching metadata
  compatibility_score   DECIMAL(5,2),
  timezone_primary      TEXT,                           -- primary timezone for cron scheduling

  -- Status
  status                TEXT NOT NULL DEFAULT 'forming'
    CHECK (status IN ('forming','active','completing','completed','dissolved')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_squads_sprint ON squads(sprint_id);
CREATE INDEX idx_squads_status ON squads(status);

-- SQUAD MEMBERS (join table)
CREATE TABLE public.squad_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id          UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id),
  role              TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','captain')),

  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at           TIMESTAMPTZ,

  -- Status within squad
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','left')),

  -- Week 6 continuation vote
  continuation_vote TEXT CHECK (continuation_vote IN ('continue','reshuffle','pause')),
  vote_cast_at      TIMESTAMPTZ,

  UNIQUE(squad_id, user_id)
);

CREATE INDEX idx_squad_members_user ON squad_members(user_id);
CREATE INDEX idx_squad_members_squad ON squad_members(squad_id);
CREATE INDEX idx_squad_members_active ON squad_members(user_id, status) WHERE status = 'active';

-- Helper function: get user's current active squad
CREATE OR REPLACE FUNCTION get_user_active_squad(p_user_id UUID)
RETURNS TABLE(squad_id UUID, squad_name TEXT, sprint_id UUID, sprint_number INT, current_week INT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, sp.id, sp.number, sp.current_week
  FROM squad_members sm
  JOIN squads s ON sm.squad_id = s.id
  JOIN sprints sp ON s.sprint_id = sp.id
  WHERE sm.user_id = p_user_id
    AND sm.status = 'active'
    AND sp.status IN ('handshake','active','dip_week','completing')
  ORDER BY sp.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
