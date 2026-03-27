-- Division Alpha: Agent Infrastructure
-- Semantic memory (pgvector), event bus, notifications

-- AGENT MEMORY (pgvector for long-term semantic patterns)
CREATE TABLE public.agent_memory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  agent_type      TEXT NOT NULL CHECK (agent_type IN ('coach','facilitator','guardian','matchmaker','analytics')),

  -- Content
  content         TEXT NOT NULL,                       -- The insight/observation/pattern
  embedding       vector(1536),                        -- text-embedding-3-small output

  -- Context
  sprint_id       UUID REFERENCES sprints(id),
  week_number     INT,
  source_type     TEXT CHECK (source_type IN (
    'checkin_pattern',          -- "User consistently yellows on professional goals"
    'goal_analysis',            -- "Goals getting more ambitious each sprint"
    'conversation_insight',     -- "User avoids confrontation when stressed"
    'squad_dynamics',           -- "User pairs well with direct accountability styles"
    'coaching_approach',        -- "Responds well to specific number targets"
    'matching_outcome'          -- "This squad composition produced 85% completion"
  )),

  -- Relevance scoring
  importance      DECIMAL(3,2) DEFAULT 0.50,           -- 0.00-1.00, can decay or be boosted
  access_count    INT DEFAULT 0,                       -- how often this memory was retrieved

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ                          -- optional TTL for ephemeral insights
);

CREATE INDEX idx_agent_memory_user ON agent_memory(user_id, agent_type);
CREATE INDEX idx_agent_memory_source ON agent_memory(source_type);

-- pgvector index (IVFFlat for initial scale, migrate to HNSW at >100K rows)
CREATE INDEX idx_agent_memory_embedding
  ON agent_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- AGENT EVENTS (inter-agent communication bus)
CREATE TABLE public.agent_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_agent    TEXT NOT NULL CHECK (source_agent IN ('matchmaker','facilitator','coach','guardian','analytics','system')),
  target_agent    TEXT NOT NULL CHECK (target_agent IN ('matchmaker','facilitator','coach','guardian','analytics','system')),

  event_type      TEXT NOT NULL,                       -- e.g., 'squad_formed', 'user_at_risk', 'score_calculated'
  payload         JSONB NOT NULL,                      -- event-specific data

  -- Processing
  processed       BOOLEAN DEFAULT false,
  processed_at    TIMESTAMPTZ,
  error           TEXT,                                -- if processing failed

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_events_target ON agent_events(target_agent, processed) WHERE processed = false;
CREATE INDEX idx_agent_events_created ON agent_events(created_at DESC);

-- NOTIFICATIONS (in-app notification system)
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),

  -- Content
  title           TEXT NOT NULL,
  body            TEXT,
  type            TEXT NOT NULL CHECK (type IN (
    'sprint_reminder',         -- "Sprint 4 starts Monday"
    'declaration_due',         -- "Monday declaration time"
    'checkin_due',             -- "Wednesday check-in time"
    'reflection_due',          -- "Friday reflection time"
    'squad_activity',          -- "Sara posted a check-in"
    'coach_message',           -- "Your Coach has a new insight"
    'nudge',                   -- Guardian nudge
    'ceremony',                -- "Kickoff ceremony tonight"
    'score_update',            -- "Your Operator Score updated"
    'tier3_invitation',        -- "You've been invited to Tier 3"
    'system'                   -- General system notification
  )),

  -- Navigation
  action_page     TEXT,                                -- 'declare','checkin','reflect','squad','coach' etc.
  action_data     JSONB,                               -- Additional context for navigation

  -- Status
  read            BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- Enable Realtime for notifications (badge count updates)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
