-- Division Alpha: Operator Scores and Squad Analytics

-- OPERATOR SCORES (6-factor composite, calculated by Analytics agent)
CREATE TABLE public.operator_scores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id),
  sprint_id           UUID NOT NULL REFERENCES sprints(id),
  week_number         INT,                             -- NULL = sprint-level score, 1-6 = weekly

  -- Composite score (0-100)
  total_score         DECIMAL(5,2) NOT NULL,

  -- Six factors (each 0-100, weights applied in calculation)
  goal_completion     DECIMAL(5,2),                    -- 25% weight
  attendance          DECIMAL(5,2),                    -- 20% weight
  squad_contribution  DECIMAL(5,2),                    -- 20% weight
  leadership          DECIMAL(5,2),                    -- 15% weight
  growth              DECIMAL(5,2),                    -- 10% weight
  communication       DECIMAL(5,2),                    -- 10% weight

  -- Ranking (updated after each calculation)
  percentile          DECIMAL(5,2),                    -- e.g., 85.0 = top 15%

  calculated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, sprint_id, week_number)
);

CREATE INDEX idx_scores_user ON operator_scores(user_id);
CREATE INDEX idx_scores_sprint ON operator_scores(sprint_id);
CREATE INDEX idx_scores_total ON operator_scores(total_score DESC);

-- SQUAD ANALYTICS (weekly health snapshots, updated by Analytics agent)
CREATE TABLE public.squad_analytics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id                  UUID NOT NULL REFERENCES squads(id),
  sprint_id                 UUID NOT NULL REFERENCES sprints(id),
  week_number               INT NOT NULL,

  -- Participation rates
  declaration_rate          DECIMAL(5,2),               -- % who declared this week
  checkin_rate              DECIMAL(5,2),               -- % who checked in
  reflection_rate           DECIMAL(5,2),               -- % who reflected

  -- Performance
  avg_completion_rate       DECIMAL(5,2),               -- avg goals hit
  green_pct                 DECIMAL(5,2),               -- % of all signals that are green
  yellow_pct                DECIMAL(5,2),
  red_pct                   DECIMAL(5,2),

  -- Engagement
  interaction_density       DECIMAL(5,2),               -- messages per member per day
  avg_response_time_hours   DECIMAL(5,2),               -- avg time to respond to prompts

  -- Health
  health_score              DECIMAL(5,2),               -- 0-100 composite
  churn_risk_score          DECIMAL(5,2),               -- 0-100 (higher = more risk)
  continuation_probability  DECIMAL(5,2),               -- predicted vote outcome

  -- AI summary
  weekly_summary            TEXT,                       -- AI-generated squad summary

  calculated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(squad_id, sprint_id, week_number)
);

CREATE INDEX idx_squad_analytics_squad ON squad_analytics(squad_id);
