-- Division Alpha: Seed Data for Development
-- Creates a full test environment: 1 sprint, 2 squads, 8 users, sample declarations/checkins

-- ============================================================
-- Sprint
-- ============================================================
INSERT INTO sprints (id, number, tier, name, week0_start, start_date, end_date, current_week, duration_weeks, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 3, 2, 'Sprint 3', '2026-02-16', '2026-02-23', '2026-04-03', 4, 6, 'active');

-- ============================================================
-- Squads
-- ============================================================
INSERT INTO squads (id, sprint_id, name, tier, member_count, health_score, completion_rate, streak, compatibility_score, timezone_primary, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Alpha Vanguard', 2, 7, 82.5, 78.0, 3, 87.0, 'America/New_York', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Iron Circuit', 2, 7, 90.0, 91.0, 3, 92.0, 'America/Los_Angeles', 'active');

-- ============================================================
-- Test Users (profiles only — auth.users must be created via Supabase Auth)
-- These are for display/testing when running with service role
-- In production, profiles are auto-created by the auth trigger
-- ============================================================

-- Note: To fully test with auth, create users via Supabase Dashboard or Auth API.
-- These INSERT statements will work if you manually create matching auth.users entries,
-- or if you disable the FK constraint during seeding.

-- For local dev, you can create test users via:
--   supabase auth users create --email amir@example.com --password testpass123

-- Sample data showing what populated profiles look like:
-- (Uncomment and use after creating auth users with matching IDs)

/*
INSERT INTO profiles (id, display_name, initials, email, bio, timezone, one_liner, primary_focus, current_stage, accountability_style, persona_type, tier, role, status, sprints_completed) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Amir M.', 'AM', 'amir@example.com', 'Building with purpose. S3 operator.', 'America/New_York', 'Building a SaaS product for interior designers', 'Professional', 'Building & Growing', 'Mix of All', 'Builder', 2, 'member', 'active', 2),
  ('c0000000-0000-0000-0000-000000000002', 'Sara R.', 'SR', 'sara@example.com', 'SaaS founder, London.', 'Europe/London', 'Shipping a design tool', 'Professional', 'Building & Growing', 'Direct and Challenging', 'Builder', 2, 'captain', 'active', 3),
  ('c0000000-0000-0000-0000-000000000003', 'Fatima N.', 'FN', 'fatima@example.com', 'Career pivoting into tech.', 'Asia/Dubai', 'Landing my first tech role', 'Professional', 'Pivoting', 'Supportive and Encouraging', 'Pivot', 2, 'member', 'active', 1),
  ('c0000000-0000-0000-0000-000000000004', 'Marcus H.', 'MH', 'marcus@example.com', 'Freelance dev scaling up.', 'America/New_York', 'Scaling freelance to agency', 'Professional', 'Scaling', 'Data-Driven and Analytical', 'Builder', 2, 'member', 'active', 2),
  ('c0000000-0000-0000-0000-000000000005', 'Omar T.', 'OT', 'omar@example.com', 'E-commerce builder.', 'America/Chicago', 'Launching an e-commerce store', 'Professional', 'Just Starting Out', 'Direct and Challenging', 'Builder', 2, 'member', 'active', 1),
  ('c0000000-0000-0000-0000-000000000006', 'James L.', 'JL', 'james@example.com', 'Career transition.', 'America/New_York', 'Moving from corporate to freelance', 'Professional', 'Pivoting', 'Supportive and Encouraging', 'Pivot', 2, 'member', 'active', 0),
  ('c0000000-0000-0000-0000-000000000007', 'Priya K.', 'PK', 'priya@example.com', 'Fitness coaching business.', 'America/Los_Angeles', 'Building a fitness coaching business', 'All three', 'Building & Growing', 'Mix of All', 'Builder', 2, 'member', 'active', 2);

-- Squad memberships
INSERT INTO squad_members (squad_id, user_id, role, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'member', 'active'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'captain', 'active'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'member', 'active'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'member', 'active'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'member', 'active'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'member', 'active'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'member', 'active');

-- Set captain
UPDATE squads SET captain_id = 'c0000000-0000-0000-0000-000000000002' WHERE id = 'b0000000-0000-0000-0000-000000000001';

-- Sprint goals for Amir
INSERT INTO sprint_goals (user_id, sprint_id, goal_text, goal_type, is_keystone, goal_order, locked) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Ship pricing page with Stripe integration', 'professional', true, 1, true),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Complete 4 deep work sessions (2hr+ each)', 'professional', false, 2, true),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Run 3 customer discovery interviews', 'professional', false, 3, true);

-- Week 4 declaration for Amir
INSERT INTO declarations (user_id, sprint_id, squad_id, week_number, goals, blockers) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 4,
   '[{"text": "Ship pricing page with Stripe integration", "order": 1}, {"text": "Complete 4 deep work sessions (2hr+ each)", "order": 2}, {"text": "Run 3 customer discovery interviews", "order": 3}, {"text": "Morning routine 5 of 7 days", "order": 4}]',
   'Stripe docs are confusing, might need help with webhooks');

-- Week 4 check-in for Amir
INSERT INTO checkins (user_id, sprint_id, squad_id, week_number, signals) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 4,
   '[{"goal_index": 0, "signal": "green", "note": null}, {"goal_index": 1, "signal": "green", "note": null}, {"goal_index": 2, "signal": "yellow", "note": "Only did 1 interview so far, scheduling is hard"}, {"goal_index": 3, "signal": "green", "note": null}]');

-- Operator score for Amir (sprint-level)
INSERT INTO operator_scores (user_id, sprint_id, week_number, total_score, goal_completion, attendance, squad_contribution, leadership, growth, communication, percentile) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL, 84.0, 82.0, 95.0, 78.0, 70.0, 88.0, 90.0, 85.0);

-- Coach conversation for Amir
INSERT INTO coach_messages (user_id, role, content, sprint_id, week_number, trigger_type) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'coach', 'Week 4 — the stretch. You''re deep enough to feel the weight, close enough to see the finish. Your pattern this sprint: strong execution on building, but the human-facing goals (interviews, networking) keep slipping. That''s not a time problem. What is it?', 'a0000000-0000-0000-0000-000000000001', 4, 'proactive'),
  ('c0000000-0000-0000-0000-000000000001', 'user', 'I keep putting off the interviews. I think I''m scared of what I''ll hear. What if nobody wants this?', 'a0000000-0000-0000-0000-000000000001', 4, 'user_initiated'),
  ('c0000000-0000-0000-0000-000000000001', 'coach', 'There it is. Fear of invalidation. You''d rather build in certainty than test in uncertainty. Here''s the reframe: every interview that kills a bad idea saves you 6 months. The builders who win aren''t fearless — they just talk to customers before they''re ready. New target: 2 interviews, not 3. Book them now. DM me when they''re scheduled.', 'a0000000-0000-0000-0000-000000000001', 4, 'user_initiated'),
  ('c0000000-0000-0000-0000-000000000001', 'user', 'Done. Booked 2 for tomorrow afternoon. One is a designer friend, one is a cold outreach who said yes.', 'a0000000-0000-0000-0000-000000000001', 4, 'user_initiated'),
  ('c0000000-0000-0000-0000-000000000001', 'coach', 'That''s the move. The cold outreach saying yes is your data point — someone you don''t know cared enough to give you their time. Pay attention to what surprises you in those conversations. The best product insights come from what you didn''t expect to hear.', 'a0000000-0000-0000-0000-000000000001', 4, 'user_initiated');

-- Notification preferences for Amir
INSERT INTO notification_preferences (user_id, sprint_reminders, squad_activity, coach_messages, weekly_digest, theme) VALUES
  ('c0000000-0000-0000-0000-000000000001', true, true, true, false, 'light');
*/

-- ============================================================
-- Sprints data that doesn't require auth users (always safe to insert)
-- ============================================================

-- Additional sprints for calendar
INSERT INTO sprints (id, number, tier, name, week0_start, start_date, end_date, current_week, duration_weeks, status) VALUES
  ('a0000000-0000-0000-0000-000000000002', 4, 2, 'Sprint 4', '2026-03-30', '2026-04-06', '2026-05-15', 0, 6, 'upcoming');

-- Sample application (no auth dependency)
INSERT INTO applications (full_name, email, timezone, one_liner, goals_text, primary_focus, current_stage, why_applying, accountability_style, persona_type, communication_freq, can_commit_3x_week, willing_to_share, no_ghosting_understood, status, target_sprint_id) VALUES
  ('Test Applicant', 'test@example.com', 'America/New_York', 'Building an AI startup', 'Ship MVP, get 10 customers, exercise 4x/week', 'Professional', 'Building & Growing', 'I''ve been procrastinating on my startup for 6 months and need structured accountability', 'Direct and Challenging', 'Builder', 'Somewhere in between', true, true, true, 'submitted', 'a0000000-0000-0000-0000-000000000002');
