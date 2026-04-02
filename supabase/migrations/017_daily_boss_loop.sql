-- Division Alpha: Daily Boss loop
-- Daily pulse state, streak tracking, and score metadata for ENTER-first operation.

CREATE TABLE public.boss_pulses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sprint_id           UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  pulse_date          DATE NOT NULL,

  -- Pulse lifecycle
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'blocked', 'missed')),
  channel             TEXT NOT NULL DEFAULT 'app'
    CHECK (channel IN ('app', 'email', 'system')),
  prompt_text         TEXT,
  response_note       TEXT,

  -- Timing
  sent_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at        TIMESTAMPTZ,
  nudge_sent_at       TIMESTAMPTZ,

  -- Score snapshot at response/reconciliation time
  score_delta         DECIMAL(5,2),
  score_after         DECIMAL(5,2),
  streak_after        INT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, sprint_id, pulse_date)
);

CREATE INDEX idx_boss_pulses_user_date ON boss_pulses(user_id, pulse_date DESC);
CREATE INDEX idx_boss_pulses_sprint_status ON boss_pulses(sprint_id, status, pulse_date DESC);

CREATE TRIGGER boss_pulses_updated_at
  BEFORE UPDATE ON boss_pulses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.operator_scores
  ADD COLUMN IF NOT EXISTS current_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_pulse_date DATE,
  ADD COLUMN IF NOT EXISTS last_pulse_status TEXT
    CHECK (last_pulse_status IN ('pending', 'completed', 'blocked', 'missed'));

ALTER TABLE public.boss_pulses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own boss pulses"
  ON boss_pulses FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users insert own boss pulses"
  ON boss_pulses FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own boss pulses"
  ON boss_pulses FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins manage boss pulses"
  ON boss_pulses FOR ALL USING (is_admin());
