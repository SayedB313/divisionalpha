-- Division Alpha: Messaging Tables
-- Squad Chat (real-time) and Coach DM (AI-powered)

-- SQUAD MESSAGES (real-time chat within a squad)
CREATE TABLE public.squad_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id        UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),

  -- Content
  content         TEXT NOT NULL,
  message_type    TEXT NOT NULL DEFAULT 'user'
    CHECK (message_type IN ('user','facilitator','system','nudge')),

  -- Thread support (optional)
  reply_to_id     UUID REFERENCES squad_messages(id),

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at       TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ                          -- soft delete
);

CREATE INDEX idx_squad_messages_squad_time ON squad_messages(squad_id, created_at DESC);
CREATE INDEX idx_squad_messages_sender ON squad_messages(sender_id);

-- Enable Realtime for squad_messages
ALTER PUBLICATION supabase_realtime ADD TABLE squad_messages;

-- COACH MESSAGES (private DM thread between user and AI Coach)
CREATE TABLE public.coach_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),

  -- Content
  role            TEXT NOT NULL CHECK (role IN ('user','coach')),
  content         TEXT NOT NULL,

  -- Context tracking (what triggered this message)
  sprint_id       UUID REFERENCES sprints(id),
  week_number     INT,
  trigger_type    TEXT CHECK (trigger_type IN (
    'user_initiated',          -- user sent a message
    'post_checkin',            -- proactive insight after Wednesday check-in
    'pre_sprint',              -- goal refinement during Week 0
    'dip_intervention',        -- Week 3 "Why Reset"
    'sprint_debrief',          -- post-sprint wrap-up
    'proactive',               -- coach-initiated outreach
    'guardian_referral'         -- Guardian flagged user, Coach follows up
  )),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_messages_user_time ON coach_messages(user_id, created_at DESC);
CREATE INDEX idx_coach_messages_sprint ON coach_messages(user_id, sprint_id);

-- Enable Realtime for coach_messages
ALTER PUBLICATION supabase_realtime ADD TABLE coach_messages;
