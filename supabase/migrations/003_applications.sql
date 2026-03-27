-- Division Alpha: Applications (Pre-signup intake form)

CREATE TABLE public.applications (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Step 1: Identity
  full_name               TEXT NOT NULL,
  email                   TEXT NOT NULL UNIQUE,
  timezone                TEXT NOT NULL,
  one_liner               TEXT,

  -- Step 2: Goals
  goals_text              TEXT,                        -- Free text: 1-3 goals
  primary_focus           TEXT CHECK (primary_focus IN ('Professional','Personal','Spiritual','All three')),
  current_stage           TEXT CHECK (current_stage IN ('Just Starting Out','Building & Growing','Scaling','Pivoting')),
  why_applying            TEXT,

  -- Step 3: Accountability Style
  accountability_style    TEXT CHECK (accountability_style IN ('Direct and Challenging','Supportive and Encouraging','Data-Driven and Analytical','Mix of All')),
  support_instinct        TEXT,
  persona_type            TEXT CHECK (persona_type IN ('Builder','Rewirer','Pivot')),
  communication_freq      TEXT CHECK (communication_freq IN ('Daily','Only check-ins','Somewhere in between')),

  -- Step 4: Commitment
  can_commit_3x_week      BOOLEAN DEFAULT false,
  willing_to_share        BOOLEAN DEFAULT false,
  no_ghosting_understood  BOOLEAN DEFAULT false,

  -- Processing
  status                  TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected','converted')),
  target_sprint_id        UUID,                        -- FK added after sprints table exists
  reviewed_at             TIMESTAMPTZ,
  converted_to_user_id    UUID REFERENCES profiles(id),

  -- Stripe checkout
  stripe_checkout_session_id TEXT,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_status ON applications(status);
