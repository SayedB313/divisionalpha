-- Division Alpha: Row Level Security Policies
-- Member sees own + squad. Captain sees squad health. Admin sees everything.

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE musharakah_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_squad_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: Check if user is admin/founder
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','founder')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Check if user is in the same squad
CREATE OR REPLACE FUNCTION is_squad_mate(p_squad_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM squad_members
    WHERE squad_id = p_squad_id AND user_id = auth.uid() AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Squad mates can view each other"
  ON profiles FOR SELECT USING (
    id IN (
      SELECT sm2.user_id FROM squad_members sm1
      JOIN squad_members sm2 ON sm1.squad_id = sm2.squad_id
      WHERE sm1.user_id = auth.uid() AND sm1.status = 'active' AND sm2.status = 'active'
    )
  );

CREATE POLICY "Admins see all profiles"
  ON profiles FOR ALL USING (is_admin());

-- ============================================================
-- SPRINTS (public read for active/upcoming)
-- ============================================================
CREATE POLICY "Anyone can view sprints"
  ON sprints FOR SELECT USING (true);

CREATE POLICY "Admins manage sprints"
  ON sprints FOR ALL USING (is_admin());

-- ============================================================
-- SQUADS
-- ============================================================
CREATE POLICY "Members see their squad"
  ON squads FOR SELECT USING (
    id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Leaderboard: see all active squads (limited fields via view)"
  ON squads FOR SELECT USING (status IN ('active','completing','completed'));

CREATE POLICY "Admins manage squads"
  ON squads FOR ALL USING (is_admin());

-- ============================================================
-- SQUAD MEMBERS
-- ============================================================
CREATE POLICY "Members see squad roster"
  ON squad_members FOR SELECT USING (is_squad_mate(squad_id));

CREATE POLICY "Users can update own vote"
  ON squad_members FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins manage squad members"
  ON squad_members FOR ALL USING (is_admin());

-- ============================================================
-- DECLARATIONS / CHECKINS / REFLECTIONS (user sees own + squad mates')
-- ============================================================

-- Declarations
CREATE POLICY "User sees own declarations"
  ON declarations FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Squad mates see declarations"
  ON declarations FOR SELECT USING (is_squad_mate(squad_id));

CREATE POLICY "User inserts own declarations"
  ON declarations FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "User updates own declarations"
  ON declarations FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins manage declarations"
  ON declarations FOR ALL USING (is_admin());

-- Check-ins
CREATE POLICY "User sees own checkins"
  ON checkins FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Squad mates see checkins"
  ON checkins FOR SELECT USING (is_squad_mate(squad_id));

CREATE POLICY "User inserts own checkins"
  ON checkins FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage checkins"
  ON checkins FOR ALL USING (is_admin());

-- Reflections
CREATE POLICY "User sees own reflections"
  ON reflections FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Squad mates see reflections"
  ON reflections FOR SELECT USING (is_squad_mate(squad_id));

CREATE POLICY "User inserts own reflections"
  ON reflections FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage reflections"
  ON reflections FOR ALL USING (is_admin());

-- ============================================================
-- SQUAD MESSAGES (only squad members)
-- ============================================================
CREATE POLICY "Squad members read messages"
  ON squad_messages FOR SELECT USING (is_squad_mate(squad_id));

CREATE POLICY "Squad members send messages"
  ON squad_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND is_squad_mate(squad_id)
  );

CREATE POLICY "Admins manage messages"
  ON squad_messages FOR ALL USING (is_admin());

-- ============================================================
-- COACH MESSAGES (private — only the user)
-- ============================================================
CREATE POLICY "Users see own coach messages"
  ON coach_messages FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users send to coach"
  ON coach_messages FOR INSERT WITH CHECK (user_id = auth.uid() AND role = 'user');

CREATE POLICY "Admins see all coach messages"
  ON coach_messages FOR ALL USING (is_admin());

-- ============================================================
-- OPERATOR SCORES
-- ============================================================
CREATE POLICY "Users see own scores"
  ON operator_scores FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Leaderboard: see all sprint-level scores"
  ON operator_scores FOR SELECT USING (week_number IS NULL);

CREATE POLICY "Admins manage scores"
  ON operator_scores FOR ALL USING (is_admin());

-- ============================================================
-- NOTIFICATIONS (private)
-- ============================================================
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users mark own as read"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins manage notifications"
  ON notifications FOR ALL USING (is_admin());

-- ============================================================
-- ENGAGEMENT / PAUSES (private + admin)
-- ============================================================
CREATE POLICY "Users see own engagement events"
  ON engagement_events FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage engagement events"
  ON engagement_events FOR ALL USING (is_admin());

CREATE POLICY "Users see own pauses"
  ON pauses FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage pauses"
  ON pauses FOR ALL USING (is_admin());

-- ============================================================
-- AGENT MEMORY (service role only — agents bypass RLS)
-- ============================================================
-- No user-facing policies. Agent functions use service_role key.

-- ============================================================
-- TIER 3 TABLES
-- ============================================================
CREATE POLICY "Squad members see their venture"
  ON ventures FOR SELECT USING (
    squad_id IN (SELECT squad_id FROM squad_members WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Admins manage ventures"
  ON ventures FOR ALL USING (is_admin());

CREATE POLICY "Venture members see agreements"
  ON musharakah_agreements FOR SELECT USING (
    venture_id IN (
      SELECT v.id FROM ventures v
      JOIN squad_members sm ON v.squad_id = sm.squad_id
      WHERE sm.user_id = auth.uid() AND sm.status = 'active'
    )
  );

CREATE POLICY "Admins manage agreements"
  ON musharakah_agreements FOR ALL USING (is_admin());

CREATE POLICY "Venture members see metrics"
  ON venture_metrics FOR SELECT USING (
    venture_id IN (
      SELECT v.id FROM ventures v
      JOIN squad_members sm ON v.squad_id = sm.squad_id
      WHERE sm.user_id = auth.uid() AND sm.status = 'active'
    )
  );

CREATE POLICY "Admins manage venture metrics"
  ON venture_metrics FOR ALL USING (is_admin());
