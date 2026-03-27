-- Division Alpha: Sprint Rhythm Tables
-- Declarations (Monday), Check-ins (Wednesday), Reflections (Friday)

-- SPRINT GOALS (locked at sprint start, per user per sprint)
CREATE TABLE public.sprint_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  sprint_id       UUID NOT NULL REFERENCES sprints(id),
  goal_text       TEXT NOT NULL,
  goal_type       TEXT CHECK (goal_type IN ('professional','personal','spiritual')),
  is_keystone     BOOLEAN DEFAULT false,               -- the ONE goal that defines sprint success
  goal_order      INT NOT NULL DEFAULT 0,

  -- Coach refinement tracking
  original_text   TEXT,                                -- pre-refinement version
  refined_at      TIMESTAMPTZ,

  -- Status
  locked          BOOLEAN DEFAULT false,
  locked_at       TIMESTAMPTZ,

  -- Final outcome (set at sprint end)
  completed       BOOLEAN,
  completion_pct  DECIMAL(5,2),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprint_goals_user_sprint ON sprint_goals(user_id, sprint_id);

-- WEEKLY DECLARATIONS (Monday)
CREATE TABLE public.declarations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  sprint_id             UUID NOT NULL REFERENCES sprints(id),
  squad_id              UUID NOT NULL REFERENCES squads(id),
  week_number           INT NOT NULL,                  -- 1-6

  -- Content: array of weekly goals
  goals                 JSONB NOT NULL,
  -- Example: [{"text": "Ship pricing page", "order": 1}, {"text": "Run 3 interviews", "order": 2}]

  blockers              TEXT,                          -- "What might get in the way?"
  help_request          TEXT,                          -- "How can my squad help?"

  -- Facilitator AI response
  facilitator_response  TEXT,
  facilitator_responded_at TIMESTAMPTZ,

  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, sprint_id, week_number)
);

CREATE INDEX idx_declarations_squad_week ON declarations(squad_id, week_number);
CREATE INDEX idx_declarations_user_sprint ON declarations(user_id, sprint_id);

-- CHECK-INS (Wednesday — Green/Yellow/Red per goal)
CREATE TABLE public.checkins (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  sprint_id             UUID NOT NULL REFERENCES sprints(id),
  squad_id              UUID NOT NULL REFERENCES squads(id),
  week_number           INT NOT NULL,

  -- Per-goal signals (references declaration goals by index)
  signals               JSONB NOT NULL,
  -- Example: [
  --   {"goal_index": 0, "signal": "green", "note": null},
  --   {"goal_index": 1, "signal": "yellow", "note": "Stuck on Stripe integration"},
  --   {"goal_index": 2, "signal": "red", "note": "Haven't started — blocked by day job"}
  -- ]

  -- Facilitator AI response
  facilitator_response  TEXT,

  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, sprint_id, week_number)
);

CREATE INDEX idx_checkins_squad_week ON checkins(squad_id, week_number);

-- REFLECTIONS (Friday)
CREATE TABLE public.reflections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  sprint_id             UUID NOT NULL REFERENCES sprints(id),
  squad_id              UUID NOT NULL REFERENCES squads(id),
  week_number           INT NOT NULL,

  -- Reflection content
  wins                  TEXT,
  misses                TEXT,
  learnings             TEXT,
  carry_forward         TEXT,

  -- Peer appreciation
  appreciated_user_ids  UUID[],                        -- squad members being thanked
  appreciation_note     TEXT,

  -- Stats (calculated from declarations + checkins at submission time)
  goals_hit             INT,
  goals_total           INT,
  completion_pct        DECIMAL(5,2),

  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, sprint_id, week_number)
);

CREATE INDEX idx_reflections_squad_week ON reflections(squad_id, week_number);
