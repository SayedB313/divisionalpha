-- Division Alpha: Tier 3 — The Operator Fund
-- Ventures, Musharakah agreements, and venture metrics

-- VENTURES (business being built by a Tier 3 Build Squad)
CREATE TABLE public.ventures (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id              UUID NOT NULL REFERENCES squads(id),
  sprint_id             UUID NOT NULL REFERENCES sprints(id),

  -- Venture details
  name                  TEXT NOT NULL,
  description           TEXT,
  problem_statement     TEXT,
  target_customer       TEXT,
  solution_summary      TEXT,
  revenue_model         TEXT,
  market_sector         TEXT,
  unfair_advantage      TEXT,

  -- Phase tracking (1=Discovery, 2=Build, 3=Grow, 4=Scale Decision)
  current_phase         INT DEFAULT 1 CHECK (current_phase IN (1, 2, 3, 4)),

  -- Aggregate metrics
  customer_interviews   INT DEFAULT 0,
  active_users          INT DEFAULT 0,
  revenue_to_date       DECIMAL(10,2) DEFAULT 0,

  -- Halal compliance
  halal_screened        BOOLEAN DEFAULT false,
  halal_screened_at     TIMESTAMPTZ,
  halal_notes           TEXT,

  -- Decision (Week 12)
  decision              TEXT CHECK (decision IN ('continue','pivot','dissolve')),
  decision_date         DATE,
  decision_notes        TEXT,

  -- Status
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','scaling','pivoted','dissolved','completed')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ventures_squad ON ventures(squad_id);
CREATE INDEX idx_ventures_status ON ventures(status);

-- BUILD SQUAD MEMBER ROLES (extends squad_members for Tier 3)
CREATE TABLE public.build_squad_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_member_id UUID NOT NULL REFERENCES squad_members(id),
  venture_id      UUID NOT NULL REFERENCES ventures(id),

  -- Tier 3 role assignment (based on Tier 2 behavioral data)
  build_role      TEXT NOT NULL CHECK (build_role IN ('architect','operator','strategist','captain','designer','domain_expert')),

  -- Equity allocation (% of operator share)
  equity_pct      DECIMAL(5,2),

  UNIQUE(squad_member_id, venture_id)
);

-- MUSHARAKAH AGREEMENTS (Islamic profit-and-loss sharing partnership)
CREATE TABLE public.musharakah_agreements (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id              UUID NOT NULL REFERENCES ventures(id),

  -- Profit/loss sharing ratios
  -- Format: {"oumafy": 15.0, "user_id_1": 25.0, "user_id_2": 20.0, ...}
  profit_shares           JSONB NOT NULL,
  loss_shares             JSONB NOT NULL,              -- losses by capital proportion

  -- Capital contributions
  -- Format: {"oumafy": 10000, "user_id_1": 0, ...}  (operators contribute labor)
  capital_contributions   JSONB,
  oumafy_seed_capital     DECIMAL(10,2) DEFAULT 0,

  -- Terms
  oumafy_equity_pct       DECIMAL(5,2) NOT NULL,       -- 10% (infra only) or 15-20% (with capital)
  vesting_months          INT DEFAULT 24,              -- Oumafy equity vests over 24 months
  revenue_share_pct       DECIMAL(5,2),                -- Alternative: 5-8% gross revenue for 36 months
  revenue_share_cap_multiplier DECIMAL(3,1),           -- e.g., 3.0x = capped at 3x infrastructure cost

  terms_text              TEXT,                        -- Full legal terms

  -- Compliance
  halal_compliant         BOOLEAN DEFAULT false,
  reviewed_by             TEXT,                        -- Who reviewed for compliance

  -- Signatures
  -- Format: [{"user_id": "...", "signed_at": "...", "role": "operator"}, ...]
  signed_by               JSONB DEFAULT '[]',
  fully_signed            BOOLEAN DEFAULT false,

  -- Status
  status                  TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending_signatures','active','completed','terminated')),

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at            TIMESTAMPTZ
);

-- VENTURE METRICS (weekly KPIs tracked during Build Sprint)
CREATE TABLE public.venture_metrics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id            UUID NOT NULL REFERENCES ventures(id),
  week_number           INT NOT NULL,

  -- Phase 1: Discovery metrics
  interviews_this_week  INT DEFAULT 0,
  insights_documented   INT DEFAULT 0,

  -- Phase 2: Build metrics
  features_shipped      INT DEFAULT 0,
  mvp_shipped           BOOLEAN DEFAULT false,
  demo_completed        BOOLEAN DEFAULT false,
  demo_feedback         TEXT,

  -- Phase 3: Grow metrics
  users_acquired        INT DEFAULT 0,
  revenue_this_week     DECIMAL(10,2) DEFAULT 0,
  retention_rate        DECIMAL(5,2),

  -- Phase 4: Scale Decision metrics
  total_users           INT DEFAULT 0,
  total_revenue         DECIMAL(10,2) DEFAULT 0,
  unit_economics_notes  TEXT,

  -- Team health
  team_health_score     DECIMAL(5,2),                  -- 0-100 from Guardian

  -- AI summary
  weekly_summary        TEXT,

  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(venture_id, week_number)
);

CREATE INDEX idx_venture_metrics_venture ON venture_metrics(venture_id);
