-- Division Alpha: User Profiles
-- Extended profile table linked to Supabase Auth

CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name          TEXT NOT NULL,
  avatar_url            TEXT,
  initials              VARCHAR(3),                    -- "AM" for avatar circles
  email                 TEXT NOT NULL,
  bio                   TEXT DEFAULT '',
  timezone              TEXT NOT NULL DEFAULT 'America/New_York',

  -- Application data (persisted from onboarding)
  one_liner             TEXT,                          -- "In one sentence, what do you do?"
  primary_focus         TEXT CHECK (primary_focus IN ('Professional','Personal','Spiritual','All three')),
  current_stage         TEXT CHECK (current_stage IN ('Just Starting Out','Building & Growing','Scaling','Pivoting')),
  accountability_style  TEXT CHECK (accountability_style IN ('Direct and Challenging','Supportive and Encouraging','Data-Driven and Analytical','Mix of All')),
  support_instinct      TEXT,                          -- "When someone in your squad is struggling..."
  persona_type          TEXT CHECK (persona_type IN ('Builder','Rewirer','Pivot')),
  why_applying          TEXT,                          -- Open text motivation
  communication_freq    TEXT CHECK (communication_freq IN ('Daily','Only check-ins','Somewhere in between')),

  -- Status & Role
  tier                  INT NOT NULL DEFAULT 2 CHECK (tier IN (1, 2, 3)),
  role                  TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','veteran','captain','admin','founder')),
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','churned','pending')),
  sprints_completed     INT NOT NULL DEFAULT 0,

  -- Stripe
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  subscription_status      TEXT DEFAULT 'inactive',

  -- Metadata
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at        TIMESTAMPTZ
);

CREATE INDEX idx_profiles_tier ON profiles(tier);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_timezone ON profiles(timezone);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, initials)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), 1) ||
          LEFT(SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), ' ', 2), 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
