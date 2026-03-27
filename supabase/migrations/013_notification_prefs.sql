-- Division Alpha: Notification Preferences

CREATE TABLE public.notification_preferences (
  user_id               UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Toggle preferences (matches Settings page UI)
  sprint_reminders      BOOLEAN NOT NULL DEFAULT true,
  squad_activity        BOOLEAN NOT NULL DEFAULT true,
  coach_messages        BOOLEAN NOT NULL DEFAULT true,
  weekly_digest         BOOLEAN NOT NULL DEFAULT false,

  -- Display preferences
  show_score_on_home    BOOLEAN NOT NULL DEFAULT true,
  compact_view          BOOLEAN NOT NULL DEFAULT false,
  show_streaks          BOOLEAN NOT NULL DEFAULT true,

  -- Theme (persisted server-side)
  theme                 TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light','dark')),

  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create preferences when profile is created
CREATE OR REPLACE FUNCTION handle_new_profile_prefs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile_prefs();

-- RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON notification_preferences FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins see all preferences"
  ON notification_preferences FOR SELECT USING (is_admin());
