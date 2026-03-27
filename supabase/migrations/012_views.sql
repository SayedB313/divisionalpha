-- Division Alpha: Views for Leaderboard and Admin Dashboard

-- OPERATOR LEADERBOARD (public-facing ranked view)
CREATE OR REPLACE VIEW public.leaderboard_operators AS
SELECT
  os.user_id,
  p.display_name,
  p.initials,
  s.name AS squad_name,
  os.total_score,
  os.goal_completion,
  os.attendance,
  os.squad_contribution,
  os.leadership,
  os.growth,
  os.communication,
  os.percentile,
  p.sprints_completed,
  RANK() OVER (ORDER BY os.total_score DESC) AS rank
FROM operator_scores os
JOIN profiles p ON os.user_id = p.id
JOIN squad_members sm ON os.user_id = sm.user_id AND sm.status = 'active'
JOIN squads s ON sm.squad_id = s.id AND s.sprint_id = os.sprint_id
WHERE os.week_number IS NULL                           -- sprint-level scores only
  AND os.sprint_id = (
    SELECT id FROM sprints WHERE status IN ('active','dip_week','completing')
    ORDER BY start_date DESC LIMIT 1
  )
ORDER BY os.total_score DESC;

-- SQUAD LEADERBOARD
CREATE OR REPLACE VIEW public.leaderboard_squads AS
SELECT
  s.id AS squad_id,
  s.name,
  s.member_count,
  s.completion_rate,
  s.health_score,
  s.streak,
  sp.number AS sprint_number,
  sa.avg_completion_rate,
  sa.checkin_rate,
  sa.interaction_density,
  RANK() OVER (ORDER BY s.completion_rate DESC) AS rank
FROM squads s
JOIN sprints sp ON s.sprint_id = sp.id
LEFT JOIN LATERAL (
  SELECT *
  FROM squad_analytics
  WHERE squad_id = s.id
  ORDER BY week_number DESC
  LIMIT 1
) sa ON true
WHERE sp.status IN ('active','dip_week','completing')
  AND s.status = 'active'
ORDER BY s.completion_rate DESC;

-- SQUAD ACTIVITY FEED (recent declarations, checkins, reflections for a squad)
CREATE OR REPLACE VIEW public.squad_activity AS
SELECT
  'declaration' AS activity_type,
  d.user_id,
  p.display_name,
  p.initials,
  d.squad_id,
  d.week_number,
  d.goals::TEXT AS content,
  NULL AS signals,
  d.submitted_at AS activity_at
FROM declarations d
JOIN profiles p ON d.user_id = p.id

UNION ALL

SELECT
  'checkin' AS activity_type,
  c.user_id,
  p.display_name,
  p.initials,
  c.squad_id,
  c.week_number,
  NULL AS content,
  c.signals::TEXT AS signals,
  c.submitted_at AS activity_at
FROM checkins c
JOIN profiles p ON c.user_id = p.id

UNION ALL

SELECT
  'reflection' AS activity_type,
  r.user_id,
  p.display_name,
  p.initials,
  r.squad_id,
  r.week_number,
  r.wins AS content,
  NULL AS signals,
  r.submitted_at AS activity_at
FROM reflections r
JOIN profiles p ON r.user_id = p.id

ORDER BY activity_at DESC;

-- ADMIN: Active squads overview
CREATE OR REPLACE VIEW public.admin_squads_overview AS
SELECT
  s.id,
  s.name,
  s.member_count,
  s.health_score,
  s.completion_rate,
  s.status,
  sp.number AS sprint_number,
  sp.current_week,
  s.captain_id,
  cap.display_name AS captain_name,
  (SELECT COUNT(*) FROM engagement_events ee
   WHERE ee.squad_id = s.id AND ee.event_type = 'escalated_to_admin'
   AND ee.created_at > now() - INTERVAL '7 days') AS recent_escalations,
  (SELECT COUNT(*) FROM pauses pa
   WHERE pa.squad_id = s.id AND pa.status = 'active') AS active_pauses
FROM squads s
JOIN sprints sp ON s.sprint_id = sp.id
LEFT JOIN profiles cap ON s.captain_id = cap.id
WHERE sp.status IN ('active','dip_week','completing')
ORDER BY s.health_score ASC;

-- ADMIN: At-risk users
CREATE OR REPLACE VIEW public.admin_at_risk_users AS
SELECT
  p.id AS user_id,
  p.display_name,
  p.email,
  s.name AS squad_name,
  ee.consecutive_misses,
  ee.event_type AS latest_event,
  ee.created_at AS event_at,
  pa.status AS pause_status
FROM profiles p
JOIN LATERAL (
  SELECT * FROM engagement_events
  WHERE user_id = p.id
  ORDER BY created_at DESC
  LIMIT 1
) ee ON true
LEFT JOIN squad_members sm ON p.id = sm.user_id AND sm.status = 'active'
LEFT JOIN squads s ON sm.squad_id = s.id
LEFT JOIN LATERAL (
  SELECT * FROM pauses
  WHERE user_id = p.id
  ORDER BY created_at DESC
  LIMIT 1
) pa ON true
WHERE ee.consecutive_misses >= 2
   OR ee.event_type = 'escalated_to_admin'
ORDER BY ee.consecutive_misses DESC, ee.created_at DESC;
