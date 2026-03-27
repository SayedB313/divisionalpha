-- Division Alpha: Engagement Tracking and Pause Protocol

-- ENGAGEMENT EVENTS (Guardian agent monitoring)
CREATE TABLE public.engagement_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id),
  squad_id            UUID REFERENCES squads(id),
  sprint_id           UUID REFERENCES sprints(id),

  -- Event tracking
  event_type          TEXT NOT NULL CHECK (event_type IN (
    'missed_declaration',
    'missed_checkin',
    'missed_reflection',
    'gentle_nudge_sent',           -- Facilitator posted public nudge
    'life_check_sent',             -- Guardian sent private DM
    'life_check_responded',        -- User responded to Life Check
    'pause_offered',
    'pause_accepted',
    'pause_declined',
    'escalated_to_admin',
    'reactivated'
  )),

  -- Streak tracking
  consecutive_misses  INT DEFAULT 0,

  -- Response data (for Life Check DM)
  response_choice     TEXT CHECK (response_choice IN (
    'heads_down',                  -- "Just forgot to post"
    'struggling',                  -- "Need support"
    'thinking_about_pausing'       -- "Might need to step back"
  )),

  -- Notes
  notes               TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_engagement_user ON engagement_events(user_id, created_at DESC);
CREATE INDEX idx_engagement_squad ON engagement_events(squad_id);
CREATE INDEX idx_engagement_type ON engagement_events(event_type);

-- PAUSES (Pause Protocol — empathy over threat)
CREATE TABLE public.pauses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  squad_id        UUID REFERENCES squads(id),
  sprint_id       UUID REFERENCES sprints(id),

  -- Dates
  paused_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  resume_by       TIMESTAMPTZ,                         -- typically 7 days from pause
  resumed_at      TIMESTAMPTZ,

  -- Status
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','resumed','expired','churned')),

  -- Reactivation nudges
  nudge_30d_sent  BOOLEAN DEFAULT false,
  nudge_30d_at    TIMESTAMPTZ,
  nudge_60d_sent  BOOLEAN DEFAULT false,
  nudge_60d_at    TIMESTAMPTZ,

  -- Reason (optional, from Life Check)
  pause_reason    TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pauses_user ON pauses(user_id);
CREATE INDEX idx_pauses_status ON pauses(status);
CREATE INDEX idx_pauses_resume ON pauses(resume_by) WHERE status = 'active';
